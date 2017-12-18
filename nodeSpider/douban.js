var request = require('superagent');
var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');
var async=require('async');
// var http

//电影链接过滤条件
var FLAG = 8.5;

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
                })
                callback(null,niceMovieLink);

            });

    },
    //遍历niceMovieLink得到优秀电影的信息
    function getMovieData(niceMovieLink,callback){

        //电影信息
        var movieData = [];
        niceMovieLink.forEach(function (link,index) {
            request.get(link).end(function(err,data){
                if(err) throw err;
                var $ = cheerio.load(data.text,{decodeEntities:false});
                movieData.push({
                    name:$('#content h1 span').text(),
                    director:$("#info  a[rel='v:directedBy']").text(),
                    actor:$("#info  a[rel='v:starring']").text(),
                    type:$("#info  span[property='v:genre']").text(),
                    playTime:$("#info  span[property='v:initialReleaseDate']").text(),
                    sumary:$("#info span[property='v:sumary']").text(),
                    imgLink:$("#mainpic img[rel='v:image']").attr("src")
                })
            })

        })
        console.log(movieData)

        callback(null,movieData)
    },

//将电影图片存入images文件夹里
    function loadImg(movieData,callback) {
    movieData.forEach(function (item,index) {
        var imglink = item.imgLink;
        console.log(imglink);
    })

    }
])
