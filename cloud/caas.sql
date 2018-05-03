 create database IF NOT EXISTS csc547caas;
 use csc547caas;
 
 CREATE TABLE IF NOT EXISTS `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `uname` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `type` varchar(32) NOT NULL DEFAULT 'guest',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uname` (`uname`)
);

CREATE TABLE IF NOT EXISTS `computer` (
  `comid` int(11) NOT NULL,
  `public_ip` varchar(255) DEFAULT NULL,
  `private_ip` varchar(255) NOT NULL,
  `total_ram` int(11) NOT NULL,
  `os` varchar(255) NOT NULL,
  `total_cores` int(11) NOT NULL,
  `state` varchar(255) NOT NULL,
  PRIMARY KEY (`comid`)
);

CREATE TABLE IF NOT EXISTS `images` (
  `imid` int(11) NOT NULL,
  `tag` varchar(255) NOT NULL,
  `ram` int(11) NOT NULL,
  `os` varchar(255) NOT NULL,
  `estimated_load_time` int(11) DEFAULT NULL,
  `cores` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  PRIMARY KEY (`imid`)
);

 CREATE TABLE IF NOT EXISTS `container` (
  `conid` int(11) NOT NULL AUTO_INCREMENT,
  `conhash` varchar(12) DEFAULT NULL,
  `comid` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `imid` int(11) NOT NULL,
  `profile` int(11) NOT NULL,
  `res_start_time` datetime NOT NULL,
  `res_end_time` datetime NOT NULL,
  `creation_time` datetime NOT NULL,
  `modified_time` datetime DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`conid`),
  KEY `uid` (`uid`),
  KEY `imid` (`imid`),
  KEY `comid` (`comid`),
  CONSTRAINT `container_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`),
  CONSTRAINT `container_ibfk_2` FOREIGN KEY (`imid`) REFERENCES `images` (`imid`),
  CONSTRAINT `container_ibfk_3` FOREIGN KEY (`comid`) REFERENCES `computer` (`comid`)
);

 CREATE TABLE IF NOT EXISTS `image_ports` (
  `imid` int(11) NOT NULL,
  `import` int(11) NOT NULL,
  PRIMARY KEY (`imid`,`import`),
  CONSTRAINT `image_ports_ibfk_1` FOREIGN KEY (`imid`) REFERENCES `images` (`imid`) ON DELETE CASCADE
);

 CREATE TABLE IF NOT EXISTS `computer_ports` (
  `comid` int(11) NOT NULL,
  `comport` int(11) NOT NULL,
  PRIMARY KEY (`comid`,`comport`),
  CONSTRAINT `computer_ports_ibfk_1` FOREIGN KEY (`comid`) REFERENCES `computer` (`comid`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `nat_ports` (
  `comid` int(11) NOT NULL,
  `natport` int(11) NOT NULL,
  PRIMARY KEY (`comid`,`natport`),
  CONSTRAINT `nat_ports_ibfk_1` FOREIGN KEY (`comid`) REFERENCES `computer` (`comid`) ON DELETE CASCADE
);

 CREATE TABLE IF NOT EXISTS `container_ports` (
  `conid` int(11) NOT NULL,
  `imid` int(11) NOT NULL,
  `import` int(11) NOT NULL,
  `comid` int(11) NOT NULL,
  `comport` int(11) NOT NULL,
  `mgmtid` int(11) NOT NULL,
  `natport` int(11) NOT NULL,
  PRIMARY KEY (`comid`,`comport`,`conid`,`imid`,`import`,`mgmtid`,`natport`),
  KEY `imid` (`imid`,`import`),
  KEY `conid` (`conid`),
  KEY `mgmtid` (`mgmtid`,`natport`),
  CONSTRAINT `container_ports_ibfk_1` FOREIGN KEY (`imid`, `import`) REFERENCES `image_ports` (`imid`, `import`) ON DELETE CASCADE,
  CONSTRAINT `container_ports_ibfk_2` FOREIGN KEY (`conid`) REFERENCES `container` (`conid`) ON DELETE CASCADE,
  CONSTRAINT `container_ports_ibfk_3` FOREIGN KEY (`comid`, `comport`) REFERENCES `computer_ports` (`comid`, `comport`) ON DELETE CASCADE,
  CONSTRAINT `container_ports_ibfk_4` FOREIGN KEY (`mgmtid`, `natport`) REFERENCES `nat_ports` (`comid`, `natport`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `storage` (
  `conid` int(11) NOT NULL,
  `local_path` varchar(128) NOT NULL,
  `remote_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`conid`,`local_path`),
  CONSTRAINT `storage_ibfk_1` FOREIGN KEY (`conid`) REFERENCES `container` (`conid`) ON DELETE CASCADE
);