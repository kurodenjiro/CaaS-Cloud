var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('This is my reservation');
  c = [{name: 'Hello', time: '0'}, {name: 'Hi', time: '1'}];
  res.render('myreservationpage', { Allcontainer: c });
});

module.exports = router;
