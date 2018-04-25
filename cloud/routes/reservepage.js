var express = require('express');
var router = express.Router();
var mysql = require('mysql')


var con = mysql.createConnection({
  host: "localhost",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

router.get('/', function(req, res, next) {

    return new Promise(function(resolve,reject)
	{
      con.connect(function(err) {

		con.query("SELECT tag from images",function (err, result, fields)
		{
			if (err) reject(err);
			console.log("tags",result);
			resolve(result);
		});
      })
		
	}).then(function(result)
	{
		let c=[];
      	for(var i=0; i<result.length;i++){
      		c.push({name: result[i].tag});
      	}
      	res.render('reserve',{Allimages: c});
	},function(err){
		console.log(err);
	})
});

module.exports = router;