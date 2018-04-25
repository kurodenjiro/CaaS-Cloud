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
  console.log('This is my admin dashboard');
  let containerQuery = "SELECT comid, res_start_time, res_end_time, imid, state from container";
  let computerQuery = "SELECT comid,public_ip, private_ip, total_ram, os, total_cores,state from computer ";

  let p1 = new Promise(function(resolve, reject) {
    con.query(computerQuery, function(err, rows, fields){
        if(err) reject(err);
        resolve(rows);
    })
  })

  let p2 = new Promise(function(resolve, reject) {
    con.query(containerQuery, function(err, rows, fields){
        if(err) reject(err);
        resolve(rows);
    })
  })
  let container;
  let computer;
  p1.then(function(data) {
    computer = data;
    return p2
  }).then(function(data) {
    container = data;
    console.log('Hello this is admin with all data');
    console.log('THis is computer data', computer);
    console.log(computer[0].public_ip, 'IP------------------');
    console.log('This is container data', );

    res.render('admindashboard',{Allcontainer: container, Allcompute: computer});
  })


});

module.exports = router;
