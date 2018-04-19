var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var app = express();
//var connection = mysql.createConnection('mysql://root:@159.89.234.84/csc547caas');

//IMP************ Define in some common file later
var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
  password: "csc547",
  database: "csc547caas"
});

let saveComputers;
app.get('/monitor', function(req, res) {
	con.connect(function(err) {
	  if (err) throw err;
	  con.query("SELECT computer.comid,computer.private_ip FROM computer", function (err, result, fields) 
	  {
	    if (err) throw err;
	    console.log(result);
	    if(isEmptyObject(result)){
	    	"You don't have any running computer"
	    }
	    else{
	    	saveComputers = result;
   			saveComputers.forEach(function(row) {
				console.log(row.comid);
				var conquery = "SELECT conhash FROM container where comid=" + con.escape(row.comid) + " AND state='active'";
				//var sql = "SELECT * FROM ?? WHERE ?? = ?";
				//var inserts = ['users', 'id', userId];
				//sql = mysql.format(sql, inserts);
				con.query(conquery, function (err, rows, fields) 
		    	{
		    		if (err) throw err;
		    		if(isEmptyObject(rows)){
		    			"You don't have any containers running on computer "+row.private_ip;
		    		}
		    		else{
		    			//saveComputers = result;
		    			rows.forEach(function(conrow){
		    				docker inspect --format='{{json .State.Health}}' conhash;//do this in ssh module
		    			});
		    		}
		    	});

			});

	    }
	  });
	});
});
app.listen(3000);

/*
	var query = connection.query("SELECT computer.comid,computer.private_ip FROM computer"); //WHERE ?? = ?";

	var inserts = ['users', 'id', userId];
	sql = mysql.format(sql, inserts);
  	select computer.comid, computer.private_ip from computer;

  	foreach computer
  	{
  		select conhash from container where comid=x and state='active';
  		docker inspect --format='{{json .State.Health}}' conhash
  		print in website in table format
  	}
});*/