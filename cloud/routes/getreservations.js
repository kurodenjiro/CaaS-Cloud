var express = require('express');
var router = express.Router();
var sql = require('../mysql');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('This is my reservation');
  console.log(req.session.username,'This is username');
  // sql.con.query()
  c = [{name: 'Hello', time: '0'}, {name: 'Hi', time: '1'}];
  res.render('myreservationpage', { Allcontainer: c });
});

module.exports = router;
