var context     = require('rabbit.js').createContext();
var mailer      = require(__dirname + '/../lib/mailer'); 
var fs 	        = require('fs'); 
var ejs         = require('ejs'); 
var template    = fs.readFileSync(__dirname + '/../templates/invitation_email.ejs'); 
var random      = require(__dirname + '/../lib/random');
var Datastore   = require('nedb'); 
var Invitations = new Datastore({filename: 'invitations.db', autoload: true}); 

var sendInvitation = function(data, task){
	
		
	var url = ['http://sitecontact.ru/signup', data.confUri].join('/'); 
			
		
	var html = ejs.render(template.toString(), {
		title: 'Подтвердите подключение данного адреса',
		confirmUrl: url
	}); 
		
	mailer({
		email: data.email,  
	    subject: 'Подтвердите подключение почтового ящика', 
	    text: 'Для подтверждения регистрации пройдите по ссылке ',  
	    html: html,  
	}, function(err, response){
	   if(err) return console.log('MAILER: ', err);  
	   task.ack(); 
	   console.log('email is sent to ' + data.email + response.message);  
	}); 
	    
}; 

context.on('ready', function(){
	var sub = context.socket('WORKER');
	sub.connect('signup', function(){
		sub.on('data', function(msg) {

			var data = JSON.parse(msg); 
			random.confirmationUri(function(confUri){
				var newUser = {
					email: data.email, 
					confUri: confUri
				}; 
				
				Invitations.insert(newUser, function(err, newDoc){
					if( err ) return console.log('NEW DB RECORD ERR: ', err); 
					
					sendInvitation(newUser, sub); 	 		
					
				});
			}); 
		
			
		});
	}); 
}); 
