var context = require('rabbit.js').createContext();
var mailer  = require('./mailer'); 

var sendMessage = function(email, task){

    mailer({
        email: email, 
        subject: 'hello ', 
        text: 'hello world', 
        html: '<h1>hello world</h2>' 
    }, function(err, response){
        if(err) return console.log('MAILER: ', err);  
        task.ack(); 
        console.log('email is sent to ' + email + response.message);  
    });    

}

var parseMessage = function(str){

	var data = null; 
	
	try{
		data = JSON.parse(str.toString()); 
	} catch(e){
		console.log(e); 
	}

	return data; 
}

context.on('ready', function(){
	sub = context.socket('WORKER');
	sub.connect('email', function(){
		
		sub.on('data', function(msg) {
			console.log('RECIEVED: ', msg.toString());  
 			var data = parseMessage(msg); 
			sendMessage(data.email, sub); 
		});
	
	}); 

}); 

