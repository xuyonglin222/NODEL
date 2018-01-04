var nodemailer  = require('nodemailer');
var router =require('express')();
var path =require('path')
var mailTransport = nodemailer.createTransport({
    host : 'smtp.sina.com',
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth : {
        user : 'test666999flag@sina.com',
        pass : 'qazwsxedc55'
    },
});


router.listen(3000,function(){
    console.log("it is running")
})
/* 浏览器输入地址（如127.0.0.1:3000/sned）后即发送 */
router.get('/send', function(req, res, next) {
    var options = {
        from        : '"你的名字" <你的邮箱地址>',
        to          : '"用户1" <邮箱地址1>, "用户2" <邮箱地址2>',
        // cc         : ''  //抄送
        // bcc      : ''    //密送
        subject        : '一封来自Node Mailer的邮件',
        text          : '一封来自Node Mailer的邮件',
        html           : '<h1>你好，这是一封来自NodeMailer的邮件！</h1><p><img src="cid:00000001"/></p>',
        attachments :
            [
                {
                    filename: '1.jpeg',            // 改成你的附件名
                    path: 'public/1.jpeg',  // 改成你的附件路径
                    cid : '00000001'                 // cid可被邮件使用
                },
                {
                    filename: '2.jpeg',            // 改成你的附件名
                    path: 'public/2.jpeg',  // 改成你的附件路径
                    cid : '00000002'                 // cid可被邮件使用
                },
            ]
    };
    res.write('hello')
    mailTransport.sendMail(options, function(err, msg){
        if(err){
            console.log(err);
            // res.render('index', { title: err });
        }
        else {
            console.log(msg);
            // res.render('index', { title: "已接收："+msg.accepted});
            res.write("已接受");
        }
    });
});

