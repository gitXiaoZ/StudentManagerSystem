// 导入模块
let express=require('express');
// 导入验证码模块
let svgCaptcha = require('svg-captcha');
// 路径模块
let path=require('path');
// 创建app
let app=express();
// 创建静态托管文件
app.use(express.static('static'));

// 路由1，响应请求页面
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/static/views/login.html'));

})
// 路由2，响应验证码
app.get('/login/captchaimg', function (req, res) {
    var captcha = svgCaptcha.create();
    // 打印验证码
	console.log(captcha.text);
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
});
// 开启监听
app.listen(80,'127.0.0.1',()=>{
    console.log('开始监听');
});