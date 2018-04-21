var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();

var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
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
    if(results.length >0)
    {
      if(password==results[0].password)
      {
        if(!req.session.username) {
            req.session.username = uname;
            req.session.uid = results[0].uid;
            console.log(req.session.username);
        }
        if(uname == 'admin')
            res.redirect('/admindashboard');
        else
            res.redirect('/dashboard');
			 }
      else
      {
        res.send({
          "success":"username and password do not match"
            })
      }
        //res.redirect('/dashboard');
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
