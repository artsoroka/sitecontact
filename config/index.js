module.exports = {
	app: {
		port: process.env.SC_APP_PORT || 8080 
	}, 
	db: {
        host     : process.env.SC_DB_HOST || 'localhost',  
        user     : process.env.SC_DB_USER || 'admin', 		
        password : process.env.SC_DB_PSWD || 'admin', 		 
        database : process.env.SC_DB 	  || 'sitecontact',  
	}
}