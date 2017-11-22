var random = require('random-string'); 

module.exports.confirmationUri = function(callback){
	var randomString = random({
		length: 33, 
		numeric: true, 
		letters: true, 
		special: false
	}); 
	callback( randomString );
             
}; 
