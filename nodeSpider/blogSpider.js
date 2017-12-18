var app = require('express')(),
    path = require('path'),
    fs = require('fs'),
    request = require('superagent'),
    cheerio = require('cheerio');
var article = [];

app.get('/',function (req,resp) {

request.get('www.cnblogs.com').end(function (err, res) {
    var $ = cheerio.load(res.text, {decodeEntities: false});
    $('.titlelnk').each(function (index, data) {
        var curUrl = $(data).attr("href");
        request.get(curUrl).end(function (err, data) {
            var $ = cheerio.load(data.text, {decodeEntities: false});
            article.push({
                title: $("#cb_post_title_url").text(),
                body: $("#cnblogs_post_body").text()
            });
        })
    });
})
    resp.send(article)
    fs.writeFile(path.join(__dirname,'2.json'),JSON.stringify(article),function(err){
        if(err) throw err;
        console.log("写入文件成功！")
    })

}).listen(8880)
