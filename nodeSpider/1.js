var request = require("request");
var cheerio = require('cheerio');
var fs = require("fs");

request('http://www.daizhuzai.com/2821/5.html',function(err,res,body){
    console.log(err);
    console.log('body',body);
    fs.appendFile('2.html',body);
})