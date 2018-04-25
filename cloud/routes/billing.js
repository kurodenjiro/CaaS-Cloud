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

  let uid=req.session.uid;

  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let statequery = "(select tag,res_start_time, res_end_time, cores,(CEIL(TIMESTAMPDIFF(SECOND,res_start_time,res_end_time)/86400))*0.50*cores AS Amount from container,images where container.imid=images.imid and uid="+uid+") UNION ( Select \"Total\" AS tag,'' as res_start_time,'' as res_end_time,'' as cores, SUM(Bill.Amount) from (select tag,res_start_time, res_end_time,(CEIL(TIMESTAMPDIFF(SECOND,res_start_time,res_end_time)/86400))*0.50*cores AS Amount from container,images where container.imid=images.imid and uid="+uid+") AS Bill)";
          con.query(statequery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      let bill=[];
      for(var i=0; i<rows.length-1;i++){
        bill.push({image: rows[i].tag, starttime: rows[i].res_start_time, endtime: rows[i].res_end_time, cores: rows[i].cores, amount: rows[i].Amount});
      }
      res.render('mybillingpage', { Allbill: bill, Total: rows[i].Amount });

  },errHandler);

});

module.exports = router;
