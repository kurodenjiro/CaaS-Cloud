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
//1. image id,ports from DB
  
/*
  var errHandler = function(err) {
    console.log(err);
  }

  return new Promise(function(resolve, reject) {
      con.connect(function(err) {
          let imquery = "SELECT import from images,image_ports WHERE images.imid = image_ports.imid AND images.tag = '"+ data.service+"'";

          con.query(imquery, function(err, rows, fields){
              if(err) reject(err);
              resolve(rows);
          })
      })
  }).then(function(rows){
      imageport = rows;
      let comportquery = "select comport from computer_ports where comid=2 AND comport NOT IN ( select comport from container_ports where comid=2)";
      console.log(rows);
      con.query(comportquery, function(err, comrows, fields){
        if (err) reject(err);
        resolve(comrows);
      })

  },errHandler).then(function(comrows){
      //3. foreach import map with available port --- map string
      for (var i = 0; i < imageport.length; i++) {
          console.log(comrows[i]);
          portmap=" "+ comrows[i].comport + ":" + imageport[0].import;
          usedports.push(rows[i].comport);
      }
      console.log(portmap);
      //4. ssh and do docker pull
      //5. ssh and do docker run on compute --- get container hash
      ssh.connect({
        host: '159.89.234.84',
        username: 'root',
        privateKey: '/home/pavi/.ssh/mydo_rsa'
      }).then( function() {
        
        let sshCmd = 'docker run -d -p '+ portmap +' localhost:5000/my-python:latest';
        ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
          console.log(result.stdout);
          //conhash = result.stdout;
          resolve(result.stdout)
        });
      });
  },errHandler).then(function(result){
      console.log(result);
            //6. If it works properly -- insert first 12 character of hash in DB

  },errHandler);
*/
  con.connect(function(err) {
      let imquery = "SELECT import from images,image_ports WHERE images.imid = image_ports.imid AND images.tag = '"+ data.service+"'";
      let portmap = "";
      let conhash = "";
      con.query(imquery, function(err, rows, fields){
          if(err) throw err;
          console.log(rows);
          var imageport = rows;
          let comportquery = "select comport from computer_ports where comid=2 AND comport NOT IN ( select comport from container_ports where comid=2)";

          
          console.log("Rows : " + rows);
          con.query(comportquery, function(err, comrows, fields){
              if (err) throw err;
              //3. foreach import map with available port --- map string
              for (var i = 0; i < imageport.length; i++) {
                  console.log(comrows[i]);
                  portmap=" "+ comrows[i].comport + ":" + imageport[0].import;
                  usedports.push(rows[i].comport);
              }
              console.log(portmap);

              //4. ssh and do docker pull
              //5. ssh and do docker run on compute --- get container hash
              ssh.connect({
                host: '159.89.234.84',
                username: 'root',
                privateKey: '/home/pavi/.ssh/mydo_rsa'
              }).then( function() {
                
                let sshCmd = 'docker run -d -p '+ portmap +' localhost:5000/my-python:latest';
                ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
                  console.log(result.stdout);
                  conhash = result.stdout;
                });
              });

          });
          //6. If it works properly -- insert first 12 character of hash in DB

          
      });
  })
  
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
