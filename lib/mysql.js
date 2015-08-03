var mysql  = require('mysql');

module.exports = function(config){
	var connection = mysql.createConnection(config); 
	connection.connect(); 
	connection.query('SET SESSION wait_timeout = 604800'); 	
	return connection; 
} 
