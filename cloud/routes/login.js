var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var main = require('../app');
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();

var con = mysql.createConnection({
  host: "152.14.112.129",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

/* POST user login */
router.post('/', function(req ,res) {
    //console.log('This is good progress');
    let data = req.body;
    console.log(data);
    var uname= req.body.username;
    var password = req.body.password;

    con.query("SELECT * FROM user WHERE uname = '"+ uname+"'", function (error, results, fields) {
          if (error)
          {
            console.log("error",error);
            res.send({
              "code":400,
              "failed":"error"
            })
          }
          else
          {
            console.log('User: ', results);
            if(results.length > 0)
            {
              bcrypt.compare(password, results[0].password, function(err, response) {
                if(response) {
                    // Passwords match
                    if(!req.session.username) {
                        req.session.username = uname;
                        req.session.uid = results[0].uid;
                        console.log(req.session.username);
                    }
                    if(results[0].type == 'admin')
                        res.redirect('/admindashboard');
                    else
                        res.redirect('/dashboard');
                } 
                else {
                      // Passwords don't match
                      res.send({
                        "success":"username and password do not match"
                      })
                } 
              });
            }
            else{
              res.send({
                  "success":"user does not exist"
              })
            }
        }
    });
})
module.exports = router;
