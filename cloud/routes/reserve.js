var express = require('express');
var router = express.Router();

/* POST user signup. */
router.post('/', function(req ,res) {
    console.log('This is reserve route');
    let data = req.body;
    console.log(data);
    // Insert the data into database and spinup the container. 

})

module.exports = router;
