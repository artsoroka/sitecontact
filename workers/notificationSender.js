var context   = require('rabbit.js').createContext();
var mailer    = require(__dirname + '/../lib/mailer'); 
var fs 	      = require('fs'); 
var ejs       = require('ejs'); 
var template  = fs.readFileSync(__dirname + '/../templates/notification_email.ejs'); 
var useragent = require('express-useragent'); 
var request   = require('request'); 

var redis     = require('redis').createClient(); 

var sendMessage = function(data, task){
    var coordinates = null; 
    request.get('http://freegeoip.net/json/' + data.meta._ip, function(err, response, body){

      if( ! err ){
	var geoData = JSON.parse(body);
	coordinates = {
		lat: geoData.latitude,  
		lng: geoData.longitude
	} 
      } 
        
	var ua   = useragent.parse(data.meta._useragent); 
	var html = ejs.render(template.toString(), {
		title: 'Новое сообщение с сайта',
		refer: data.meta._referer, 
		message: data.message, 
		useragent: {browser: ua.Browser, os: ua.OS}, 
		ipAddress: data.meta._ip, 
		geolocation: coordinates 
	}); 
	
    mailer({
        email: data.meta._email, 
        subject: 'Новое сообщение с сайта', 
        text: 'У вас новое сообщение',  
        html: html,  
    }, function(err, response){
        if(err) return console.log('MAILER: ', err);  
        task.ack(); 
	redis.incr(data.meta._email); 
        console.log('email is sent to ' + data.meta._email + response.message);  
    });    
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

