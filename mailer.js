var nodemailer = require("nodemailer"); 
var host 	   = process.env.SC_HOST; 
var port 	   = process.env.SC_PORT; 
var user       = process.env.SC_USER; 
var password   = process.env.SC_PSWD; 

var mailer = nodemailer.createTransport("SMTP", {
    host: host, 
    secureConnection: true, 
    port: port,  
    auth: {
        user: user, 
        pass: password 
    }
});  


module.exports = function(message, callback){

	var mailOptions = {
	    from: "SiteContact <info@message.email>",  
	    to: message.email,  
	    subject: message.subject,  
	    text: message.text, 
	    html: message.html
	}

	mailer.sendMail(mailOptions, callback);

}
