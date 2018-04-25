var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CSC 547 Cloud Computing' });
});

router.get('/signup', function(req ,res) {
    console.log('This is good progress');
    let data = req.body;
    console.log(data);
})

module.exports = router;
