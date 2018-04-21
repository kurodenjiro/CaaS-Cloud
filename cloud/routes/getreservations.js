var express = require('express');
var router = express.Router();
var mysql = require('mysql')


var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
  password: "csc547",
  database: "csc547caas"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('This is my reservation');

  console.log(req.session.username,'This is username');
  // sql.con.query()
  c = [{name: 'Hello', time: '0'}, {name: 'Hi', time: '1'}];
  res.render('myreservationpage', { Allcontainer: c });

  let uid=req.session.uid;

  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let imquery = "SELECT images.tag,creation_time,conid from images,container WHERE images.imid = container.imid AND container.uid ="+ uid +" AND container.state='available'";

          con.query(imquery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      let c=[];
      for(var i=0; i<rows.length;i++){
      	c.push({name: rows[i].tag, time: rows[i].creation_time, conid: rows[i].conid});
      }
  	  res.render('myreservationpage', { Allcontainer: c });
  },errHandler);


});

module.exports = router;
