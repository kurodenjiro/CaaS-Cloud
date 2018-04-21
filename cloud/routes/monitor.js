var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var main = require('../app');

var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
  password: "csc547",
  database: "csc547caas"
});

let saveComputers=[];
let saveIP = {};
let c= {};
router.get('/', function(req ,res) {
	var errHandler = function(err){
		console.log(err);
	}

	con.connect(function(err) {
	  if (err) throw err;
	  return new Promise(function(resolve,reject){
		  con.query("SELECT DISTINCT(computer.comid),computer.private_ip FROM computer,container WHERE container.comid = computer.comid AND container.state='available'", function (err, result, fields) 
		  {
		    	if (err) throw reject(err);
		    	resolve(result);

		   });
	  }).then(function(result){
	  			for(var i=0;i<result.length; i++)
	  			{
					var conquery = "SELECT container.conhash,computer.private_ip FROM container,computer where computer.comid = container. comid and container.comid=" + result[i].comid + " AND container.state='available'";
					c[result[i].private_ip]={}
					con.query(conquery,function(err,conhashrows,fields){
						let count=0;
						if(err) reject(err);

						for(var j=0; j < conhashrows.length; j++){
							let sshCmd = "docker inspect 57a2891da621";// + conhashrows[j].conhash;
							console.log(sshCmd);
							
							return new Promise(function(resolve,reject){
								ssh.connect({
			          			  host: '159.89.234.84',//conhashrows[j].private_ip,
			          			  username: 'root',
			          			  privateKey: '/home/pavi/.ssh/mydo_rsa'
			          			}).then( function() {
			          			  
			          			  ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
			          			    resolve(JSON.parse(result.stdout)[0]['State']['Status']);
			          			  });
		          				});

							}).then(function(status){
								c[conhashrows[j].private_ip][conhashrows[j].conhash] = status;
								console.log(c);

							},errHandler);
						}
					});
	  			}

	  },errHandler);
	});
});

module.exports = router;
