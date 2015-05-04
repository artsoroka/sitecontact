var express     = require("express"); 
var validator   = require('validator'); 
var rabbit      = require('rabbit.js'); 
var ctx         = rabbit.createContext(); 
var pub         = ctx.socket('PUSH');  
var redis       = require('redis').createClient(); 
var app         = express(); 
var port        = process.env.SC_APP_PORT || 8080; 
var bodyParser  = require('body-parser'); 
var extend      = require('util')._extend; 

app.use(express.static(__dirname + '/public')); 

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

app.get('/', function(req, res){
    res.send('hello'); 
}); 

app.post('/:email', function(req,res){

    res.header("Access-Control-Allow-Origin", "*"); 
    
    var email   = req.params.email; 
    var message = req.body; 
    
    extend(message, {
        _email: email, 
        _ip: req.ip, 
        _referer: req.headers['referer']
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
        app.listen(port);  
        console.log('app is listening on a port: ', port); 
    });
});
