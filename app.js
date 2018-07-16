// 导入模块--------------------------------------------
let express=require('express');
// 导入验证码模块
let svgCaptcha = require('svg-captcha');
// 路径模块
let path=require('path');
// 引入session中间件
let session = require('express-session');
// 解析post请求数据的中间件body-parser
let bodyParser = require('body-parser');
// 连接数据库模块
let MongoClient = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017';
const dbName = 'test';

// 创建app-------------------------------------
let app=express();
// 创建静态托管文件
app.use(express.static('static'));

// 使用session功能
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
  }))
// 使用body-parser功能
app.use(bodyParser.urlencoded({ extended: false }));

// 路由--------------------------------------------------
// 路由1，响应登录面
app.get('/login',(req,res)=>{
    
    res.sendFile(path.join(__dirname,'/static/views/login.html'));
    
});

// 路由2，用户登录判断
app.post('/login',(req,res)=>{
    // 获取数据,post请求需要body中间件
    // console.log(res.body);
    let username=req.body.username;
    let userpass=req.body.userpass;
    let code=req.body.code;
    
    //首先先判断验证码正不正确
    if(code==req.session.captcha){
        //验证码正确，把用户名密码放进session里

        // 连接数据库，判断用户名和密码
        MongoClient.connect(url, function(err, client) {
            const db = client.db(dbName);
            // Get the documents collection
            const collection = db.collection('userList');
            // Insert some documents
            collection.find({username,userpass}).toArray(function(err, docs) {
                if(docs.length==0){
                    // 数据库不存在，用户名或密码错误
                    res.send('<script>alert("用户名或密码错误"); window.location.href="/login"</script>')
                }else{
                    // 正确，存进session里
                    req.session.userinfo={
                        username,
                        userpass
                    };
                    // 跳到首页
                    res.redirect('/index');
                }
                client.close(); 
            });
           
        });
        
        
        
    }else{
       
        res.send('<script>alert("验证码错误"); window.location.href="/login"</script>')
    }
   

});

// 路由3，响应验证码生成
app.get('/login/captchaimg.jpg', function (req, res) {
    var captcha = svgCaptcha.create();
    // 打印验证码
    console.log(captcha.text);
   
    // 把验证码存进session里
	req.session.captcha = captcha.text.toLocaleLowerCase();
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
    res.status(200).send(captcha.data);
   
});

// 路由4，在首页判断有没有登录
app.get('/index',(req,res)=>{
    if(req.session.userinfo){
        // 登录了，返回首页内容
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    }else{
        // 没有登录，去登录页
        res.send('<script>alert("请登录"); window.location.href="/login"</script>')
    }
});

// 路由5，退出登录
app.get('/loginout',(req,res)=>{
    delete req.session.userinfo;
    res.send('<script>alert("退出登录成功"); window.location.href="/login"</script>')
});

// 路由6，响应注册页
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/register.html'));
});

// 路由7，注册，往数据库里添加数据
app.post('/register',(req,res)=>{
    // 获取数据
   
     let username=req.body.username;
     
     let userpass=req.body.userpass;
    // 查询数据库
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('userList');
        collection.find({username}).toArray(function(err, docs) {
           if(docs.length==0){
                //用户名不存在，可以注册
                
                collection.insertMany([
                    {username,userpass}
                  ], function(err, result) {
                      console.log(err);
                    res.send('<script>alert("注册成功，欢迎加入"); window.location.href="/login"</script>')
                });

           }else{
            //    用户名存在，不可以注册
                res.send('<script>alert("注册失败，用户名已存在"); window.location.href="/register"</script>')
           }
            
           client.close();
        });
    });
})

// 开启监听--------------------------
app.listen(80,'127.0.0.1',()=>{
    console.log('开始监听');
});