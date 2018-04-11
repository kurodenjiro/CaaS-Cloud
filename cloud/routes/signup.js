var express = require('express');
var router = express.Router();

/* POST user signup. */
router.post('/', function(req ,res) {
    console.log('This is good progress');
    let data = req.body;
    console.log(data);
    // put the data into the database
    // res.redirect to dashboard
    res.redirect('/dashboard');

})

module.exports = router;
