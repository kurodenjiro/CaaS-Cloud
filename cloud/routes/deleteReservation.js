var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
    console.log('Delete');
    console.log(req.body)
});

module.exports = router
