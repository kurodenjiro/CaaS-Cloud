var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');

var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
  password: "csc547",
  database: "csc547caas"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('This is my reservation');

  let uid=1;

  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let imquery = "SELECT images.tag,creation_time from images,container WHERE images.imid = container.imid AND container.uid ="+ uid +" AND container.state='available'";

          con.query(imquery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      let c=[];
      for(var i=0; i<rows.length;i++){
      	c.push({name: rows[i].tag, time: rows[i].creation_time});
      }
  	  res.render('myreservationpage', { Allcontainer: c });
  },errHandler);
  //c = [{name: 'Hello', time: '0'}, {name: 'Hi', time: '1'}];
  
});

module.exports = router;
