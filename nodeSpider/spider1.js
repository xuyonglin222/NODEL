var app = require('express')(),
    superagent = require('superagent'),
    cheerio = require('cheerio');
var PORT = 8880;
var urlArr = [];
for (var i = 0; i < 200; i++) {
    urlArr[i] = "https://www.cnblogs.com/#p" + (i+1);
}
var linkArr = [];
for (var i = 0; i < 200; i++) {
   start(i,urlArr[i])
}

function start(index,currUrl){
    superagent.get(currUrl).end(function (err, data) {
        if (err) {
            throw err;
        }
        var $ = cheerio.load(data.text, {decodeEntities: false});
        console.log(currUrl)
        console.log($('.post_item_body .titlelnk').prop('href'))

    })
}