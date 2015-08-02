var mysql  = require('mysql');

module.exports = function(config){
	console.log('DB CONFIG: ', config);
	var connection = mysql.createConnection(config); 
	connection.connect(); 
	return connection; 
} 