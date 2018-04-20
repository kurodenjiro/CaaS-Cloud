var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();
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
/*
0. Scheduling -- check computer
0.5 Loadbalancing
5.5 Add iptable rule for NAT in management node
*/
  var imageport=0;
  let portmap = "";
  let conhash = "";
  let usedports = [];
  let imid = 0;
//1. image id,ports from DB


  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let imquery = "SELECT import,images.imid from images,image_ports WHERE images.imid = image_ports.imid AND images.tag = '"+ data.service+"'";

          con.query(imquery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      console.log("First resolve");
      console.log(rows);
      // console.log(r);
      imageport = rows;
      imid = rows[0].imid;
      let comportquery = "select comport from computer_ports where comid=2 AND comport NOT IN ( select comport from container_ports where comid=2)";
      // console.log(rows);
      return new Promise(function(resolve, reject) {
        con.query(comportquery, function(err, comrows, fields){
          if (err) reject(err);
          console.log(comrows, "hello");
          // return comrows;
          resolve(comrows);
        })
      })


  },errHandler).then(function(comrows){
      console.log("Second resolve");
      console.log("this is comrows", comrows);
      console.log("length", imageport.length);
      // console.log("")
      //3. foreach import map with available port --- map string

      for (var i = 0; i < imageport.length; i++) {
          console.log(comrows[i]);
          portmap=" "+ comrows[i].comport + ":" + imageport[i].import;
          usedports.push({comport: comrows[i].comport, import: imageport[i].import });
      }
      console.log(portmap);
      //4. ssh and do docker pull
      //5. ssh and do docker run on compute --- get container hash
      return new Promise(function(resolve, reject) {
          ssh.connect({
            host: '159.89.234.84',
            username: 'root',
            privateKey: '/home/pavi/.ssh/mydo_rsa'
          }).then( function() {

            let sshCmd = 'docker run -d -p '+ portmap +' localhost:5000/my-python:latest';

            ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
              console.log(result.stdout);
              resolve(result.stdout)
            });
          });
      })

  },errHandler).then(function(result){
      console.log(result, "conhash");
      //6. If it works properly -- insert first 12 character of hash in DB
      conhash = result;
      let containerquery = "INSERT INTO container(conid,conhash,comid,uid,imid,profile,res_start_time,res_end_time,creation_time,modified_time,state) VALUES(4,'"+result.substring(0,11)+"', 2, 1,"+imid+",1,'2018-01-01 03:00:00','2018-01-01 03:00:00', NOW(), '2018-01-01 03:00:00', 'available')";
      // console.log(rows);
      return new Promise(function(resolve, reject) {
        con.query(containerquery, function(err, controws, fields){
          if (err) reject(err);
          //console.log(comrows, "hello");
          // return comrows;
          if(err) console.log(err);
          
          resolve();
        })
      })

  },errHandler).then(function(){
      let getconidquery = "SELECT conid from container ORDER BY conid desc LIMIT 1";
      // console.log(rows);
      return new Promise(function(resolve, reject) {
        con.query(getconidquery, function(err, idrows, fields){
          if (err) reject(err);
          //console.log(comrows, "hello");
          // return comrows;
          //if(err) console.log(err);
          console.log(idrows[0].conid);
          resolve(idrows[0].conid);
        })
      })
  },errHandler).then(function(result){
      
      return new Promise(function(resolve,reject){

          for( var i=0; i < usedports.length; i++){
              let portmappingquery = "INSERT INTO container_ports(conid, imid, import, comid, comport) VALUES("+result+","+imid+", "+usedports[i].import+","+2+","+usedports[i].comport+")";
              con.query(portmappingquery, function(err,rows,fields){
                  if(err) reject(err);
                  resolve();
              });
          }

        
      })
  },errHandler).then(function(){
      console.log("Reservation completed");
  },errHandler);

/*
-------------- TO DO ---------------------------
docker pull 159.89.234.84:5000/my-python;
6.5 add used port in DB container_ports
7. Print reservation connection info
8. Security for ssh
*/
    // Insert the data into database and spinup the container.

})

module.exports = router;
