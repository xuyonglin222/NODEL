var net = require('net');
var io= require('socket.io').listen(8012);
var fs=require('fs');
var app=require('express')();
app.listen(8888);
// app.set("view engine","html");
app.get('/',function(req,res){
    res.sendFile('C:\\Users\\徐永林\\Desktop\\WebSocket\\socket\\index.html');


});
var socketServer= net.createServer().listen(8124,function(){
    console.log('socketServer is running on '+ 8124);
})
socketServer.on('connection',function (socket) {
    socket.on('data',function(str){
        io.emit('recvTxt',str.toString());
        socket.write("socketServer received "+ str);
    });
    socket.on('end',function(){
        console.log("连接断开")
    });
})

var userCount=0;
io.sockets.on('connection',function(socket){
    userCount++;
    console.log(socket.handshake)
    socket.on('sendTxt',function(data){
        console.log(userCount);
    })
    socket.on('disconnect', function(){
        userCount--;
        console.log(io.sockets.sockets)
    });

    console.log(`${userCount} users connected`);
});
