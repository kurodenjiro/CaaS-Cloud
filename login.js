var express = require('express');
var router = express.Router();
var email= req.body.email;
var password = req.body.password;

  con.query('SELECT * FROM user WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
    console.log("error",error);
    res.send({
      "code":400,
      "failed":"error"
    })
  }else{
    console.log('User logged in: ', results);
    if(results.length >0){
      if([0].password == password){
        res.send({
          "code":200,
          "success":"login is sucessfull"
            });
			      }
      else{
        res.send({
          "code":204,
          "success":"Email and password do not match"
            });
      }
    }
    else{
      res.send({
        "code":204,
        "success":"Email does not exist"
          });
    }
  }
  });
