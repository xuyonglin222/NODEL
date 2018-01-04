var request = require('superagent');
var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var async=require('async');
// var http

//电影链接过滤条件
var FLAG = 2;

async.waterfall([
    function getMoviesList(callback) {
        request.get('https://movie.douban.com/cinema/nowplaying/changsha/')
            .end(function(err,data){
                if(err){
                    throw err;
                }
                var $ = cheerio.load(data.text,{decodeEntities:false});
                var niceMovieLink = [];

                $("#nowplaying .list-item").each(function (index,item) {
                    var score=$(item).attr('data-score');
                    if(score>FLAG){
                        var link = $(item).find(".ticket-btn").attr("href");
                        niceMovieLink.push(link);
                    }
                });
                callback(null,niceMovieLink);

            });

    },
    //遍历niceMovieLink得到优秀电影的信息
    function getMovieData(niceMovieLink,callback){
        var movieData=[];
        (function iterator(index){
            if(index == niceMovieLink.length){
                callback(null,movieData);
                return;
            }
            request.get(niceMovieLink[index]).end(function (err, data) {
                if (err) throw err;
                var $ = cheerio.load(data.text, {decodeEntities: false});
                var item;
                item = {
                    name: $('#content h1 span').text(),
                    director: $("#info  a[rel='v:directedBy']").text(),
                    actor: $("#info  a[rel='v:starring']").text(),
                    type: $("#info  span[property='v:genre']").text(),
                    playTime: $("#info  span[property='v:initialReleaseDate']").text(),
                    sumary: $("#info span[property='v:sumary']").text(),
                    imgLink: $("#mainpic img[rel='v:image']").attr("src")
                };
                movieData.push(item);
                iterator(index+1);
            })
        })(0);

    },

//将电影图片存入images文件夹里
    function loadImg(movieData,callback) {
        var imglinks =[];
        movieData.forEach(function (item,index) {
        imglinks.push(item.imgLink);
      });
        (function iterator(index){
            if(index == imglinks.length){
                return;
            }
            request.get(imglinks[index]).end(function(err,data){
                console.log("imglinks"+index+ "   ");
                console.log(data);
            })
            iterator(index+1)
        })(0);

    }
]);
