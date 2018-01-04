var app =require('express')();
var mysql = require('mysql');
var bodyParser= require('body-parser');
var conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'rfid'
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


//连接数据库
conn.connect();
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.post('/main/login',function(req,res){
    var user = req.body.Username;
    var psd = req.body.Passwd;
    console.log(user)
    console.log(psd)
    conn.query('select password from user where username = ?',user,function(err,resp){
        if(err) throw err;
        console.log(resp[0])
        if(resp==''){
            res.send({
                "stateCode":404,
                "message":"用户名不存在",
                "data":""
            })
        }
       else if(resp[0].password==psd){
            res.send({
                "stateCode":200,
                "message":"登录成功",
                "data":""
            })
        }
        else{
            res.send({
                "stateCode":403,
                "message":"密码错误",
                "data":""
            })
        }
    })
})
//返回车辆信息
app.post('/main/getCarInfo', function(req,res){
    var para= req.body.CarTagId;
    conn.query('select * from carinfo where TagId = ?',para,function(err,resp){
        if(err) throw err;
        if(resp==''){
            res.send({
                "stateCode":404,
                "message":"该ID不存在",
                "data":""
            })
        }
        else{
            // 返回数据到客户端
            var str = JSON.stringify(resp[0])
            res.send({
                "stateCode":200,
                "message":"query OK",
                "data":str
            });
        }
})
})
//返回行程信息
app.post('/main/getRouteInfo', function(req,res){
    var para= req.body.CarTagId;
    conn.query('select * from routeinfo where TagId = ?',para,function(err,resp){
        if(err) throw err;
        if(resp==''){
            res.send({
                "stateCode":400,
                "message":"该ID不存在",
                "data":""
            })
        }
        else{
            // 返回数据到客户端
            var str = JSON.stringify(resp[0]);
            res.send({
                "stateCode":200,
                "message":"query OK",
                "data":str
            });
        }
    })
})
//更新历史行程信息
app.post('/main/postRouteInfo', function(req,res){
    var data = req.body;
    var id=req.body.CarTagId;
    var isStart=req.body.IsStart;
    var dataIn=[];
    var datas =JSON.parse(data.Data);
    for(key in datas){
        dataIn.push(datas[key])
    }
    console.log(datas)
    console.log(dataIn)
    console.log(isStart)
    if(isStart=='True'){
        conn.query('insert into routeinfo(Distance,EndTime,EndStat,StartTime,StartStat,TagId) values(?,?,?,?,?,?)',dataIn,function(err,resp){
            console.log("ssss")
            if(err) throw err;
            if(resp==""){
                res.send({
                    "stateCode":404,
                    "message":"录入数据库失败",
                    "data":""
                })
            }
            else{
                // 返回数据到客户端
                res.send({
                    "stateCode":200,
                    "message":"save OK",
                    "data":"inert routeinfo successful"
                });
            }
        })
    }
    else{
        console.log("ss")

        //查询车辆型号
        conn.query('select Type from carinfo where TagId = ?',id,function(err,respp){
            //查询各个型号对应的收费标准
            conn.query('select * from toll where Type = ?',respp[0].Type,function(err,result){
                dataIn[dataIn.length]=result[0].UnitCost*datas.Distance;
                console.log(dataIn[6]);

                conn.query('insert into historyrouteinfo(Distance,EndTime,EndStat,StartTime,StartStat,TagId,Cost) values(?,?,?,?,?,?,?)',dataIn,function(err,response){
                    if(err) throw err;
                })
                conn.query('delete from routeinfo where TagId = ?',id,function(err,res){
                    if(err) throw err;
                })
            });
        });

    }

})

//返回收费标准
app.get('/main/getToll',function(req,res){
    conn.query('select * from toll',function(err,result){
        if(err) throw err;
        if(result==""){
            res.send({
                "stateCode":"404",
                "message":"数据库里未找到",
                "data":""
            })
        }
        else{
            var str=JSON.stringify(result);
           res.send({
               "stateCode":200,
               "message":"query OK",
               "data":str
           })
        }
    })
})
//获取历史行程信息
app.post('/main/getHistoryRouteInfo',function(req,res){
    conn.query('select * from historyrouteinfo where TagId = ?',req.body.CarTagId,function(err,resp){
        if(err)  throw err;
        if(resp==''){
            res.send({
                "stateCode":404,
                "message":"该ID不存在",
                "data":""
            })
        }
        else{
            // 返回数据到客户端
            var str = JSON.stringify(resp);
            res.send({
                "stateCode":200,
                "message":"query OK",
                "data":str
            });
        }
    })

})
app.listen(8888,function(){
console.log('The server is running on 8888')
})