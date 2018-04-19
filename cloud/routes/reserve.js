var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
/* POST user signup. */
var con = mysql.createConnection({
  host: "159.89.234.84",
  user: "pavi",
  password: "csc547",
  database: "csc547caas"
});

router.post('/', function(req ,res) {
    console.log('This is reserve route');
    let data = req.body;
    console.log(data);
    con.connect(function(err) {
        if (err) throw err;
        console.log('COnnected succesfully')
    })
    // Insert the data into database and spinup the container.

})

module.exports = router;
