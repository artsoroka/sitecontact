DROP TABLE IF EXISTS `emails`; 
CREATE TABLE `emails` (
  id int auto_increment PRIMARY KEY, 
  email varchar(100) NOT NULL, 
  confirmation_key varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 DEFAULT COLLATE utf8_unicode_ci;