var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();
/* POST user signup. */
var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
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
    var type =req.body.type;
    //}
    // put the data into the database
    // res.redirect to dashboard

    let userquery = "INSERT INTO user (uname, password,email) VALUES ('"+ uname+"', '"+ password+"', 'default@csc.com' )";

    con.query(userquery,function (error, results, fields) {
      if (error) {
        console.log("error",error);
        res.send({
          "code":400,
          "failed":"Username already exists, choose another username"
        })
      }else{
        console.log('User registered: ', results);
        res.redirect('/dashboard');
      //  res.send({
        //  "code":200,
        //  "success":"user registration sucess"
        //    });
    		}
      });

})

module.exports = router;
