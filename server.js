var express     = require("express"); 
var validator   = require('validator'); 
var rabbit      = require('rabbit.js'); 
var ctx         = rabbit.createContext(); 
var pub         = ctx.socket('PUSH'); 
var signup      = ctx.socket('PUSH'); 
var redis       = require('redis').createClient(); 
var app         = express(); 
var port        = process.env.SC_APP_PORT || 8080; 
var bodyParser  = require('body-parser'); 
var extend      = require('util')._extend; 
var Datastore   = require('nedb'); 
var Invitations = new Datastore({filename: 'invitations.db', autoload: true}); 

app.use(express.static(__dirname + '/public')); 
app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

app.get('/', function(req, res){
    res.render('mainpage');  
}); 

app.get('/signup/:confirmationKey', function(req, res){
    Invitations.findOne({confUri: req.params.confirmationKey}, function(err, doc){
        if( err || ! doc) return res.send('invalid confirmation key');  
        
        redis.set(doc.email, 0, function(){
            res.render('status',{
                status: 'Адрес подтверждён!', 
                message: 'Вы успешно подтвердили адрес электронной почты: форма активна и готова к работе'
            });  
        });
        
    }); 
});

app.post('/signup', function(req, res){
    var email = req.body.email; 
     
    if( ! validator.isEmail(email) ) 
        return res.status(400).render('status', {
            status: 'Произошла ощибка', 
            message: 'Неправильный формат адреса электронной почты'
        }); 

    signup.write(JSON.stringify({
        email: email
    }, 'utf8'));
    
    res.render('status', {
        status: 'Почти готово!', 
        message: 'Мы отправили Вам на почту тестовое сообщение. В нём вы найдёте ссылку для подтвержения владения указанным почтовым адресом '
    }); 
    
}); 

app.post('/:email', function(req,res){

    res.header("Access-Control-Allow-Origin", "*"); 
    
    var email   = req.params.email; 
    var message = req.body; 
    
    extend(message, {
        _email: email, 
        _ip: req.ip, 
        _referer: req.headers['referer'], 
	    _useragent: req.headers['user-agent']
    }); 
    
    if( ! validator.isEmail(email) ) 
        return res.send('this is not valid email'); 
    
    redis.get(email, function(err, record){
	    if( err ) return res.send('could not connect to the database'); 
        if( ! record ) return res.send('email is not registered'); 
        
        pub.write(JSON.stringify(message, 'utf8')); 
	    
        if(message._redirect)
            return res.redirect(message._redirect); 
        
        res.send('your email is sent'); 

    });
}); 

ctx.on('error', function () { 
    console.log('could not connect to the message broker');  
});

ctx.on('ready', function() {
    pub.connect('email', function() {
        signup.connect('signup', function(){
            app.listen(port);  
            console.log('app is listening on a port: ', port);     
        });
    });
});
