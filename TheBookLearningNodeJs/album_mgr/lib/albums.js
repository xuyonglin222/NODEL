var fs = require('fs'),
    album = require('./../album.js');
exports.version = '1.0.0';

exports.albums = function(root,callback){
    //we will just assume that any direcorty in our 'album'
    //subfolder is an album
    fs.readdir(root+'albums',function(err,files){
        console.log(root +'albums')
        if(err){
            callback(err);
            return;
        }
         var album_list = [];
        (function iterator(index){
            if(index == files.length){
                callback(null,album_list);
                return;
            }

            fs.stat(root+"albums/"+ files[index],function(err,stats){
                if(err){
                    callback({error:"file_error",
                            message:JSON.stringify(err)
                    });
                    return;
                }
                if(stats.isDirectory()){
                    var p = root + "albums/"+files[index];
                    console.log(p);
                    album_list.push(album.create_album(p));
                }
                iterator(index+1);
            })
        })(0);
    })
}
