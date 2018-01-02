var http = require("http");
var fs = require("fs");
var url = require("url");
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

    req.parsed_url = url.parse(req.url,true);
    var core_url = req.parsed_url.pathname;
    console.log(req.parsed_url);
    if(core_url == '/albums.json'){
        handle_list_albums(req,res);
    }else if(core_url.substr(core_url.length - 12) == '/rename.json'
    &&req.method.toLowerCase() == 'post'){
        handle_rename_album(req,res);
    }
    else if(core_url.substr(0,7) == '/albums'
        && core_url.substr((core_url.length - 5) == '.json'
        && req.method.toLowerCase() == 'get')){
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
function handle_rename_album(req,res){
    //1.GET the album name from the URL
    var core_url = req.parsed_url.pathname;
    var parts = core.split('/');
    if(parts.length!=4){
        send_failure(res,404,invalid_resource(core_url));
        return;
    }

    var album_name = parts[2];

    //2.get the post data for the request. this will have the json
    //for the new name for the album.
    var json_body = '';
    req.on('readable',function () {
        var d = req.read();
        if(d){
            if(typeof d =='string'){
                json_body +=d;
            }else if(typeof d =='object' && d instanceof  Buffer){
                json_body += d.toString('utf8');
            }
        }
    });

    //3. when we have all the post data,make sure we have valid.
    //data and then try to do rename
    req.on('end',function(){
        //did we have a body?
        if(json_body){
            try{
                var album_data = JSON.parse(json_body);
                if(!album_data.album_name){
                    send_failure(res,403,missing_data('album_name'));
                    return;
                }
            }catch (e){
                //got a body ,but not valid json
                send_failure(res,403,bad_jaon());
                return;
            }

            //4. Perform rename!
            do_rename(album_name,      //old
                album_data.album_name, //new
               function(err,results){
                if(err &&err.code == "ENOENT"){
                    send_failure(res,403,no_such_album());
                    return;
                }else if(err){
                    send_failure(res,500,file_error(err));
                    return;
                }
                send_success(res,null);
               });
        }else{
            send_failure(res,403,bad_json());
            res.end();
        }
    })
   }
function load_album(album_name,page,page_size,callback){
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
                var ps;
                //slice fails gracefully if params are out of range
                ps = only_files.splice(page * page_size,page_size);
                var obj = {short_name:album_name,photos:ps};
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
    //get the GET params
    var getp = req.parsed_url.query;
    var page_num=getp.page?getp.page:0;
    var page_size = getp.page_size?getp.page_size:1000;

    if(isNaN(parseInt(page_num))) page_num = 0;
    if(isNan(parseInt(page_size))) page_size = 1000;

    //format of request is /albums/album_name.json
    var core_url = req.parsed_url.pathname;

    var album_name = core_url.substr(7,req.url.length-12);
    console.log("album_name: "+album_name);
    load_album(album_name,page_num,page_size,function(err,album_contents){
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