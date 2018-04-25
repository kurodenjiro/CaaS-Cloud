var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var main = require('../app');
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();
/* POST user signup. */
var con = mysql.createConnection({
  host: "152.14.112.129",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});



/* POST user signup. */
router.post('/', function(req ,res) {
    console.log('This is good progress');
    let data = req.body;
    console.log(data);
    //var users={
    var uname = req.body.username;
    var password= req.body.password;
    var email =req.body.email;
    //}
    // put the data into the database
    // res.redirect to dashboard
    bcrypt.hash(password, 10, function(err, hash) {
          let userquery = "INSERT INTO user (uname, password,email) VALUES ('"+ uname+"', '"+ hash+"', '"+ email +"' )";

          con.query(userquery,function (error, results, fields) {
              if (error) {
                console.log("error",error);
                res.send({
                  "code":400,
                  "failed":"Username already exists, choose another username"
                })
              }else{
                console.log('User registered: ', results);
                if(!req.session.username) {
                        req.session.username = uname;
                        req.session.uid = results.insertId;
                        console.log("username",req.session.username);
                        console.log("uid",req.session.uid);
                }
                res.redirect('/dashboard');
              }
          });
    });


})

module.exports = router;
