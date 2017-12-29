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
                        allback(make_error("file_error",JSON.stringify(err)));
                        return;
                    }
                    if(stat.isDirectory()){
                        var obj = {name:files[i]};
                        only_dirs.push(obj);
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
    if(req.url == '/albums.json'){
        handle_list_albums(req,res);
    }
    else if(req.url.substr(0,7) == '/albums' && req.url.substr((req.url.length - 5) == '.json')){
        handle_get_album(req,res);
    }else{
        send_failure(res,404,invalid_resource());
    }
}
function handle_list_albums(req,res){
    load_album_list(function(err,albums){
        if(err){
            send_failure(res,500,err);
            return;
        }
        send_success(res,{albums:albums});
    });
}
function load_album(album_name,callback){
    //we will just assume that any directory in our 'albums'
    //subfolder is an album.
    fs.readdir('albums/'+album_name,function(err,files){
        if(err){
            if(err.code == "ENOENT"){
                callback(no_such_album());
            }else{
                callback(make_error("file_error",JSON.stringify(err)));
            }
            return;

        }

        var only_files = [];
        var path = "albums/"+album_name +'/';
        (function iterator(index){
            if(index ==files.length){
                var obj = {short_name:album_name,photos:only_files};
                callback(null,obj);
                return;
            }
            fs.stat(path+files[index],function(err,stat){
                if(err){
                    callback(make_error("file_error",JSON.stringify(err)));
                    return;
                }
                if(stat.isFile()){
                    var obj = {
                        filename:files[index],
                        desc:files[index]
                    };
                    only_files.push(obj);
                }
                iterator(index+1);
            })
        })(0);

    })
}

function handle_get_album(req,res){
    var album_name = req.url.substr(7,req.url.length-12);
    console.log("album_name: "+album_name);
    load_album(album_name,function(err,album_contents){
        if(err&&err.error == "no_such_album"){
            send_failure(res,404,err);
            return;
        }
        else if(err){
            send_failure(res,500,err);
            return;
        }else{
            send_success(res,{album_data:album_contents});
        }
    });
}

function make_error(err,msg){
    var e =new Error(msg);
    e.code = err;
    return e;
}

function send_success(res,data){
    res.writeHead(200,{"Content-Type":"application/json"});
    var output = {error : null,data:data};
    res.end(JSON.stringify(output)+"\n");
}
function send_failure(res,code,err){
    var code = (err.code)?code:err.name;
    console.log(code)
    res.writeHead(code,{"Content-Type":"application/json"});
    res.end(JSON.stringify({error:code,message:err.message}) + "\n");
}
function invalid_resource(){
    return make_error("invalid_resource","the requested resourse does not exist");
}
function no_such_album(){
    return make_error("no_such_album","The specified album does not ecist");
}
var s = http.createServer(handle_incoming_request);
s.listen(8080,function(){
    console.log("server is running on 8080");
})