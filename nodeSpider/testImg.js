var http = require("http");
var fs = require("fs");

http.get('http://s3.mogucdn.com/mlcdn/c45406/171118_1d25l7128kdbel5h4f42hlkc8eae3_640x960.jpg_220x330.jpg', function (res) {
    var imgContent;
    res.setEncoding('binary');
    res.on('data', function (chunk) {
        imgContent += chunk;
    }).on('end',function () {
        console.log(res.statusCode)
        fs.writeFile('images/2.jpg', imgContent, 'binary', function (err) {
            if (err) {
                console.log("图片保存失败")
            }
            else{
                console.log("图片保存成功")
            }

        })
    })

})