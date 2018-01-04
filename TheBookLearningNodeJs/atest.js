var amgr = require('./album_mgr');
amgr.albums('./album_mgr/',function(err,albums){
    if(err){
        console.log("error:  "+JSON.stringify(err));
        return;
    }
    (function iterator(index){
        if(index == albums.length){
            console.log("Done");
            return;
        }
        albums[index].photos(function(err,photos){
            if(err){
                console.log("err loading album: "+ JSON.stringify(err));
                return;
            }
            console.log(albums[index].name);
            console.log(photos);
            console.log("\n ");
            iterator(index+1);
        })
    })(0)
});