var context = require('rabbit.js').createContext();
var mailer  = require('./mailer'); 

var sendMessage = function(data, task){

    var html = '<ul>'; 
    for(p in data.message){
      html += '<ul>' + [p, data.message[p]].join(':') + '</ul>';  
    }
    html += '</ul>';  

    mailer({
        email: data.meta._email, 
        subject: 'hello ', 
        text: 'hello world', 
        html: html,  
    }, function(err, response){
        if(err) return console.log('MAILER: ', err);  
        task.ack(); 
        console.log('email is sent to ' + data.meta._email + response.message);  
    });    

}

var parseMessage = function(str){

	var data = null; 
	
	try{
		data = JSON.parse(str.toString()); 
	} catch(e){
		console.log(e); 
	}

	if( ! data ) return data; 

        var metaData = {}; 
        var message  = {}; 

        for(property in data){
	  if(property[0] == '_'){
	    metaData[property] = data[property]; 
	  } else {
            message[property] = data[property]; 
	  }
        } 
        return {
	  message: message, 
	  meta: metaData
        }; 

}

context.on('ready', function(){
	sub = context.socket('WORKER');
	sub.connect('email', function(){
		
		sub.on('data', function(msg) {
			console.log('RECIEVED: ', msg.toString());  
 			
			var data = parseMessage(msg); 
			console.log('PARSED: ', data); 
			
 			sendMessage(data, sub); 
		});
	
	}); 

}); 

