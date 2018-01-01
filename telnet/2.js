var net = require( 'net' );
var count = 0,
    users = {};
var server = net.createServer( function ( conn ) {// conn 是net.Stream流，可读可写
    conn.nickname = '';// 将用户名绑定在对应的连接上，这样就不会出现后来的用户名覆盖之前的用户名。
    conn.setEncoding( 'utf-8' ); // 设置编码格式，在服务器(node)上可以显示中文，客户端用的是zeta telnet，无法显示中文
    conn.write(
        '> welcome to node-chat. '
        + '\r\n> ' + count + ' other people are connected a this time.'
        + '\r\n> please enter your name and press enter: '
    );
    count++;// 创建了一个用户，用户数量加1
    conn.on( 'data', function ( data ) {
        data = data.replace( '/(\r\n)|(\r)|(\n)/', '' );//
        console.log(data);
        if ( !conn.nickname && /\w+/.test(data) ) {// 首次打开客户端时nickname为''，并且判断用户名格式
            if ( users[data] ) {// 如果用户存在
                conn.write( '\033[93m> nickname already in use. try another:\033[39m' );
                return;
            } else {// 如果用户不存在
                conn.nickname = data;// 本连接的用户名
                users[conn.nickname] = conn;// 将用户添加到用户队列（对象）中
                for ( var i in users ) {// 用户加入，通知每个用户，包括自己
                    users[i].write( '\033[90m > ' + conn.nickname + ' joined the room.\033[39m\n' );
                }
            }
        } else {
            if ( !/\w+/.test(data) ) { // 如果用户名不符合规范
                console.log( '用户名只能是数字字母下划线' );
            } else { // 如果用户已存在，这里是用户发言广播到其他客户端
                for ( var i in users ) {
                    if ( i != conn.nickname ) {// 不通知自己
                        users[i].write( '\033[96m > ' + conn.nickname + ' say:\033[39m' + data + '\r\n' );
                    }
                }
            }
        }
    })
    conn.on( 'close', function () {// 断开连接时
        count--;
        delete users[conn.nickname];
    })

});
server.listen( 3000, function () {
    console.log( '\033[96mserver listening on *:3000\033[39m' );
});