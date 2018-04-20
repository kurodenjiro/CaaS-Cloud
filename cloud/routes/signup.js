var express = require('express');
var router = express.Router();
var mysql = require('../mysql');
/* POST user signup. */
router.post('/', function(req ,res) {
    console.log('This is good progress');
    let data = req.body;
    console.log(data);
    sql = new mysql();
    sql.con.connect(function(err) {
      if(err) throw err;
      console.log('THis is success')
    })
    // put the data into the database
    // res.redirect to dashboard
    res.redirect('/dashboard');

})

module.exports = router;
