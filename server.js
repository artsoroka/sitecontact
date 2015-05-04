var express   = require("express"); 
var validator = require('validator'); 
var rabbit    = require('rabbit.js'); 
var ctx       = rabbit.createContext(); 
var pub       = ctx.socket('PUSH');  
var redis     = require('redis').createClient(); 
var app       = express(); 
var port      = process.env.SC_APP_PORT || 8080; 

app.use(express.static(__dirname + '/public')); 

app.get('/', function(req, res){
    res.send('hello'); 
}); 

app.get('/:email', function(req,res){

    var email = req.params.email; 
    
    if( ! validator.isEmail(email) ) 
        return res.send('this is not valid email'); 
    
    redis.get(email, function(err, record){
	if( err ) return res.send('could not connect to the database'); 
        if( ! record ) return res.send('email is not registered'); 
        
        pub.write(JSON.stringify({email:email}, 'utf8')); 
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
