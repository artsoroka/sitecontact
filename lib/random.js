var random = require('node-random'); 

module.exports.confirmationUri = function(callback){
    random.strings({
        length: 10, 
        number: 5, 
        upper: false, 
        digits: true
    }, function(err, randomString){
        
        if(err) return console.log('UID generation error: ', err); 
        
        callback( randomString.join('-') );  
        
    });     
}; 
