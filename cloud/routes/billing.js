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
  console.log('This is my billing');

  console.log(req.session.username,'This is username');
  // sql.con.query()


  let uid=req.session.uid;

  var errHandler = function(err) {
    console.log(err);
  }


});

module.exports = router;
