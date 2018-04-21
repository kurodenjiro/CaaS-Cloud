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
    var users={
      "uname":req.body.username,
      "password":req.body.password,
      "type":req.body.type
    }
    // put the data into the database
    // res.redirect to dashboard


    con.query('INSERT INTO user SET ?',users, function (error, results, fields) {
      if (error) {
        console.log("error",error);
        res.send({
          "code":400,
          "failed":"error"
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
