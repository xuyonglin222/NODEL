var http = require("http");
var fs = require("fs");

//磁盘I/O
function load_album_list(callback){
    fs.readdir('albums',function(err,files){
        if(err){
            callback(err);
            return;
        }

        var only_dirs=[];
        (function iterator(i){
            if(i==files.length){
                callback(null,only_dirs);
                return;
            }
            else{
                fs.stat('albums/'+files[i],function(err,stat){
                    if(err){
                        throw err;
                    }
                    if(stat.isDirectory()){
                        only_dirs.push(files[i]);
                    }
                    iterator(i+1);
                });
            }
        })(0)
    });
}

//网络通讯
function handle_incoming_request(req,res){
    console.log("INCOMING REQUEST: "+ req.method +" "+req.url);
    load_album_list(function(err,albums){
        if(err){
            res.writeHead(503,{"Content-Type":"application/json"});
            res.end(JSON.stringify(err)+"\n");
            return;
        }

        var out={
            error:null,
            data:{
                albums:albums
            }
        };
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(out)+"\n");
    })
}

var s = http.createServer(handle_incoming_request);
s.listen(8080,function(){
    console.log("server is running on 8080");
})