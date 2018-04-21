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
  let conid=0;
  let computeip='159.89.234.84';
  let computeid=3;
  let mgmtip='159.89.234.84';
  let mgmtid=1;
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
      let comportquery = "select comport from computer_ports where comid="+computeid+" AND comport NOT IN ( select comport from container_ports where comid="+computeid+")";
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
          usedports.push({comport: comrows[i].comport, import: imageport[i].import ,natport:0 });
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
      let containerquery = "INSERT INTO container(conhash,comid,uid,imid,profile,res_start_time,res_end_time,creation_time,modified_time,state) VALUES('"+result.substring(0,11)+"', "+computeid+", 1,"+imid+",1,'2018-01-01 03:00:00','2018-01-01 03:00:00', NOW(), '2018-01-01 03:00:00', 'available')";
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
	  conid=idrows[0].conid;
          resolve();
        })
      })
  },errHandler).then(function(){
      console.log("Available nat ports");

      let natquery = "select natport from nat_ports where comid="+mgmtid+" AND natport NOT IN ( select natport from container_ports)";
      return new Promise(function(resolve, reject) {
            con.query(natquery, function(err, natrows, fields){
              if (err) reject(err);


              resolve(natrows);
            });
      })


  },errHandler).then(function(natrows){
      return new Promise(function(resolve, reject) {
          //SSH and add IPtables rules
          console.log("came here",usedports);
          for (var i = 0; i < usedports.length; i++) {
              usedports[i]["natport"]= natrows[i].natport;
          }
          resolve();
      })
  }).then(function(){
      console.log("IP Tables function");

      // IPtables Nat rules
      return new Promise(function(resolve, reject) {
          //SSH and add IPtables rules
          console.log("came here",usedports);
          for (var i = 0; i < usedports.length; i++) {
              let sshCmd = 'iptables -t nat -A PREROUTING -d '+ mgmtip +' -p tcp --dport '+ usedports[i].natport +' -j DNAT --to-destination '+computeip+':'+usedports[i].comport;
              console.log(sshCmd);
              ssh.connect({
                host: '159.89.234.84' ,
                username: 'root',
                privateKey: '/home/pavi/.ssh/mydo_rsa'
              }).then( function() {

                ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
                  console.log("Added rules");
                  console.log(result.stderr);
                });
              });
          }
          resolve();

      });

  },errHandler).then(function(){

      return new Promise(function(resolve,reject){

          for( var i=0; i < usedports.length; i++){
              let portmappingquery = "INSERT INTO container_ports(conid, imid, import, comid, comport,mgmtid,natport) VALUES("+conid+","+imid+", "+usedports[i].import+","+2+","+usedports[i].comport+","+mgmtid+","+usedports[i].natport+")";
              con.query(portmappingquery, function(err,rows,fields){
                  if(err) reject(err);
                  resolve();
              });
          }


      })
  },errHandler).then(function(){
      console.log("W completed");
      res.ren
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
