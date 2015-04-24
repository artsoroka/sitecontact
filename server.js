var express   = require("express"); 
var mailer    = require('./mailer');   
var app       = express(); 
var port      = process.env.SC_APP_PORT || 8080; 

app.use(express.static(__dirname + '/public')); 

app.get('/', function(req, res){
    res.send('hello'); 
}); 

app.get('/:email', function(req,res){

    var email = req.params.email; 
    
    if( ! email.match('@') ) 
        return res.send('this is not valid email'); 
    
    mailer({
        email: email, 
        subject: 'hello', 
        text: 'hello world', 
        html: '<h1>hello world</h2>' 
    }, function(err, response){
        if(err) return res.send(err); 
        res.send('email is sent to ' + email + response.message);  
    });    

}); 

app.listen(port);  

console.log('app is listening on a port: ', port); 