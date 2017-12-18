var request = require("request");
var fs = require("fs");
var url='http://s3.mogucdn.com/mlcdn/c45406/171118_1d25l7128kdbel5h4f42hlkc8eae3_640x960.jpg_220x330.jpg'

request
    .get(url)
    .end(function(err, img_res){
        if(img_res.status == 200){
            // 保存图片内容
            fs.writeFile('images/6.jpg', img_res.body, 'binary', function(err){
                if(err) console.log(err);
            });
        }
    });