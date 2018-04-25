var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
var NODE_SSH = require('node-ssh');
var schedule = require('../schedule');
var dateTime = require('node-datetime');

var scheduleObject = new schedule();

ssh = new NODE_SSH();
/* POST user signup. */
var con = mysql.createConnection({
  host: "152.14.112.129",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

router.post('/', function(req ,res) 
{
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
  let computeid;
  let mgmtip='159.89.234.84';
  let mgmtid=1;
  let uid=req.session.uid;
  let computer;
//1. image id,ports from DB


  	var errHandler = function(err) {
    		console.log(err);
  	}

	scheduleObject.create_schedule(con, data).then(function(value){
		console.log("insideschedulecall");
		computeid=value;
		console.log("haha"+computeid);
	

  	return new Promise(function(resolve, reject) 
	{
      		con.connect(function(err) {
          		let imquery = "SELECT import,images.imid from images,image_ports WHERE images.imid = image_ports.imid AND images.tag = '"+ data.service+"'";

          		con.query(imquery, function(err, rows, fields){
              			if(err) throw(err);
       				resolve(rows);
          		})
      		})
  	}).then(function(rows){
      			console.log("resolve:image ports:"+rows);
      			console.log(rows);
      			// console.log(r);
      			imageport = rows;
      			imid = rows[0].imid;
	
	
			console.log("hostid:"+computeid);
      			let comportquery = "select comport from computer_ports where comid="+computeid+" AND comport NOT IN ( select comport from container_ports where comid="+computeid+")";
       			//console.log(rows);
      			return new Promise(function(resolve, reject) {
        			con.query(comportquery, function(err, comrows, fields){
          				if (err) throw(err);
          				//console.log("resolve:computer ports:"+comrows);
          				// return comrows;
          				resolve(comrows);
        			})
      	  		})
	},errHandler).then(function(comrows){
      				//console.log("Second resolve");
      				//console.log("this is comrows", comrows);
      				//console.log("length", imageport.length);
				console.log("resolve:computer ports:"+comrows);
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
	
				let computequery="select * from  computer where comid="+computeid+";"; 
				return new Promise(function(resolve,reject){
					con.query(computequery, function(err,comprows,fields){
						if(err)  reject(err);
						computer=comprows[0];
						resolve();
					})
				}).then(function(result){
                                
                                
                                var dt = dateTime.create();
                                var formatted = dt.format('YYYY-mm-dd HH:MM:SS');
                                let containerquery = "INSERT INTO container(conhash,comid,uid,imid,profile,res_start_time,res_end_time,creation_time,modified_time,state) VALUES('"+result.substring(0,11)+"', "+computeid+","+uid+","+imid+","+data.profile+",'"+data.start+"','"+data.end+"', '"+formatted+"', null, 'reserved')";
                                // console.log(rows);
                                return new Promise(function(resolve, reject) {
                                                console.log(containerquery);
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
                                                                                        //console.log(comrows, "hello")
;
                                                                                        // return comrows;
                                                                                        //if(err) console.log(err);
                                                                                        console.log(idrows[0].conid);
                                                                                        conid=idrows[0].conid;
                                                                                        resolve();
                                                        })
                                })
                },errHandler).then(function(){
      						return new Promise(function(resolve, reject) {
          						ssh.connect({
            							host: computer.public_ip,
            							username: 'root',
            							privateKey: computer.ssh_key_path//'/home/pavi/.ssh/mydo_rsa'
          						}).then( function() {

            							let sshCmd = null;
							if(data.profile == 2 )
							{
								sshCmd = 'mkdir /root/local'+conid+'; docker-machine ssh dev mkdir /root/remote'+conid+'; eval $(docker-machine env dev); docker run -d -p '+ portmap +' '+mgmtip+':5000/'+data.service+':latest -v /root/local'+conid+':/root/'+conid+'';
							}
							else
							{
								sshCmd = 'docker run -d -p '+ portmap +' '+mgmtip+':5000/'+data.service+':latest';
							}
            							ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
              								console.log(result.stdout);
             							 	resolve(result.stdout)
            							});
          						});
      						})
					})

  		},errHandler).then(function(result){
				//result='abcshhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh8888';
      				console.log(result, "conhash");
      					//6. If it works properly -- insert first 12 character of hash in DB
      				conhash = result;
				let containerquery = "update container set conhash = '"+result.substring(0,11)+"',state = 'available' where conid ="+conid+";";
      				// console.log(rows);
      				return new Promise(function(resolve, reject) {
						console.log(containerquery);
        					con.query(containerquery, function(err, controws, fields){
          						if (err) reject(err);
          						//console.log(comrows, "hello");
          						// return comrows;
          						if(err) console.log(err);

          						resolve();
        					})
      				})

  		},errHandler).then(function(result){
                   let storagequery = "insert into storage values("+conid+",'/root/local"+conid+"','/root/remote"+conid+"')";
                                return new Promise(function(resolve, reject) {
                                                console.log(storagequery);
                                                con.query(storagequery, function(err, storagerows, fields){
                                                        if (err) reject(err);
                                                        if(err) console.log(err);

                                                        resolve();
                                                })
                                })

                },errHandler)then(function(){
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
              					let sshCmd = 'iptables -t nat -A PREROUTING -d '+ mgmtip +' -p tcp --dport '+ usedports[i].natport +' -j DNAT --to-destination '+computer.public_ip+':'+usedports[i].comport;
              					console.log(sshCmd);
              					ssh.connect({
            						host: 'localhost',
            						username: 'root',
            						//privateKey: '/home/pavi/.ssh/mydo_rsa'
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
              				let portmappingquery = "INSERT INTO container_ports(conid, imid, import, comid, comport,mgmtid,natport) VALUES("+conid+","+imid+", "+usedports[i].import+","+computeid+","+usedports[i].comport+","+mgmtid+","+usedports[i].natport+")";
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
})
module.exports = router;
