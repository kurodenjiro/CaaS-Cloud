var mysql = require('mysql');
//var con = mysql.createConnection('mysql://root:@159.89.234.84/csc547caas');

//IMP************ Define in some common file later
var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "hkadako",
  password: "csc547",
  database: "csc547caas"
});

con.connect(function(err){
if(!err) {
    console.log("Database connected");
} else {
    console.log("Error connecting database");
}
});

exports.register = function(req,res){
  // console.log("req",req.body);
  var dt = new Date();
  var users={
    "name":req.body.first_name,
	"type":req.body.type,
    "email":req.body.email,
    "password":req.body.password,
    "created":dt,
    "modified":dt
  }
  con.query('INSERT INTO user SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error",error);
    res.send({
      "code":400,
      "failed":"error"
    })
  }else{
    console.log('User registered: ', results);
    res.send({
      "code":200,
      "success":"user registration sucess"
        });
		}
  });
}

exports.login = function(req,res){
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
}
