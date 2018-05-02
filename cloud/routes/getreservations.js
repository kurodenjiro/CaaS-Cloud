var express = require('express');
var router = express.Router();
var mysql = require('mysql')


var con = mysql.createConnection({
  host: "localhost",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('This is my reservation');

  console.log(req.session.username,'This is username');
  // sql.con.query()


  let uid=req.session.uid;

  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let imquery = "SELECT images.tag,creation_time,container.conid,public_ip,natport from images,container,computer,container_ports WHERE container.conid = container_ports.conid AND container_ports.mgmtid=computer.comid AND images.imid = container.imid AND container.uid ="+ uid +" AND container.state='available' ORDER BY container.conid";

          con.query(imquery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      let c=[];
      for(var i=0; i<rows.length;i++){
      	c.push({name: rows[i].tag, time: rows[i].creation_time, conid: rows[i].conid, constring: rows[i].public_ip+':'+rows[i].natport});
      }
  	  res.render('myreservationpage', { Allcontainer: c });
  },errHandler);


});

module.exports = router;
