var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
var NODE_SSH = require('node-ssh');
var schedule = require('../schedule');
var dateTime = require('node-datetime');
const exec = require('child_process').exec;
var scheduleObject = new schedule();

ssh = new NODE_SSH();
/* POST user signup. */
var con = mysql.createConnection({
  host: "localhost",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

router.post('/', function(req ,res) 
{
console.log("Starting now..............",dateTime.create().format('Y-m-d H:M:S'));
    console.log('This is reserve route');
    let data = req.body;
    console.log(data);

    var dt = dateTime.create();
    let startdate;
    if(data.radiobutton==1){
        startdate = dt.format('Y-m-d H:M:S');
    }else{
        let day = new Date();
        day.setDate(getDate()+data.day);
        day.setHours(data.hr);
        day.setMinutes(data.min);
        console.log("day",day);
        startdate = dateTime.create(day.toLocaleString().slice(0,-3));
    }
//    let day = new Date();
    console.log(startdate);
    let enddate=startdate+data.duration;

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
  let computeip;
  let computeid;
  let mgmtip;
  let mgmtpublicip;
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
		console.log("image query");
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
				console.log("resolve:computer ports:"+comrows);
      				//3. foreach import map with available port --- map string

      				for (var i = 0; i < imageport.length; i++) {
          				console.log(comrows[i]);
          				portmap=" -p "+ comrows[i].comport + ":" + imageport[i].import;
          				usedports.push({comport: comrows[i].comport, import: imageport[i].import ,natport:0 });
      				}
      				console.log(portmap);
      				//4. ssh and do docker pull
      				//5. ssh and do docker run on compute --- get container hash
				let computequery="select * from  computer where comid="+computeid+" OR comid="+mgmtid+" ORDER BY comid"; 
				return new Promise(function(resolve,reject){
					con.query(computequery, function(err,comprows,fields){
						if(err)  reject(err);
            			mgmtip=comprows[0].private_ip;
            			mgmtpublicip=comprows[0].public_ip;
				computer = comprows[1];
						resolve();
					})

				}).then(function(){
				console.log("insert container");

                                var dt = dateTime.create();
                                var formatted = dt.format('YYYY-mm-dd HH:MM:SS');
                                let containerquery = "INSERT INTO container(comid,uid,imid,profile,res_start_time,res_end_time,creation_time,modified_time,state) VALUES("+computeid+","+uid+","+imid+","+data.profile+",'"+startdate+"','"+enddate+"', NOW(), null, 'available')";
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
				console.log("select container");
                                let getconidquery = "SELECT conid from container ORDER BY conid desc LIMIT 1";
                                // console.log(rows);
                                return new Promise(function(resolve, reject) {
                                                con.query(getconidquery, function(err, idrows, fields){
                                                                                        if (err) reject(err);
                                                                                        //console.log(comrows, "hello")

                                                                                        // return comrows;
                                                                                        //if(err) console.log(err);
                                                                                        console.log(idrows[0].conid);
                                                                                        conid=idrows[0].conid;
                                                                                        resolve();
                                                        })
                                })
                },errHandler).then(function(){
				console.log("inside docker queries");

      						return new Promise(function(resolve, reject) {
          						ssh.connect({
            							host: computer.private_ip,
            							username: 'root',
                          privateKey: '/home/csc547/.ssh/id_rsa'
          						}).then( function() {
								let sshCmd;
								if(data.profile == 2)
								{
									console.log("with remote storage");
									sshCmd = 'mkdir /root/files/local'+conid+'; docker-machine ssh dev mkdir /root/files/remote'+conid+'; docker-machine mount dev:/root/files/remote'+conid+' /root/files/local'+conid+'; eval $(docker-machine env dev); docker pull '+mgmtip+':5000/'+data.service+' && docker run -d '+ portmap +' -v /root/files/local'+conid+':/tmp/'+conid+' '+mgmtip+':5000/'+data.service+':latest';
									console.log(sshCmd);
								}
								else if(data.profile == 1)
                                                                {
                                                                        console.log("with local storage");
                                                                        sshCmd = 'mkdir /root/files/local'+conid+'; docker pull '+mgmtip+':5000/'+data.service+' && docker run -d '+ portmap +' -v /root/files/local'+conid+':/tmp/'+conid+' '+mgmtip+':5000/'+data.service+':latest';
                                                                        console.log(sshCmd);
                                                                }
								else
								{
									console.log("without storage");
            								sshCmd = 'docker pull '+mgmtip+':5000/'+data.service+' && docker run -d '+ portmap +' '+mgmtip+':5000/'+data.service+':latest';
								}
            							ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
              								console.log(result.stdout);
             							 	resolve(result.stdout)
            							});
          						});
      						})
					})

  		},errHandler).then(function(result){
				console.log("update container");
                                //result='abcshhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh8888';
                                console.log(result, "conhash");
                                        //6. If it works properly -- insert first 12 character of hash in DB
                                conhash = result.split("\n");
                                let containerquery = "update container set conhash = '"+conhash[conhash.length -1].substring(0,11)+"',state = 'available' where conid ="+conid+";";
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
			console.log("inside storage query");
		if(data.profile != 3)
		{
			let storagequery;
			if(data.profile == 2)
			{
                   	 storagequery = "insert into storage values("+conid+",'/root/files/local"+conid+"','/root/files/remote"+conid+"')";
                        }
			else
			{
			storagequery = "insert into storage values("+conid+",'/root/files/local"+conid+"', null)";
			}
			        return new Promise(function(resolve, reject) {
                                                console.log(storagequery);
                                                con.query(storagequery, function(err, storagerows, fields){
                                                        if (err) reject(err);
                                                        if(err) console.log(err);

                                                        resolve();
                                                })
                                })
		}
                },errHandler).then(function(){
				console.log("inside nat ports");
      					console.log("Available nat ports");

      					let natquery = "select natport from nat_ports where comid="+mgmtid+" AND natport NOT IN ( select natport from container_ports)";
      					return new Promise(function(resolve, reject) {
            								con.query(natquery, function(err, natrows, fields){
              								if (err) reject(err);


              								resolve(natrows);
         				   				});
      					})


  		},errHandler).then(function(natrows){
			console.log("update ip tables");
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
              					let sshCmd = 'sudo iptables -t nat -I PREROUTING -d '+ mgmtpublicip +'/24 -p tcp --dport '+ usedports[i].natport +' -j DNAT --to-destination '+computer.private_ip+':'+usedports[i].comport;
              					console.log(sshCmd);

                        exec(sshCmd, (e, stdout, stderr)=> {
                            if (e instanceof Error) {
                                console.error(e);
                                throw e;
                            }
                            console.log('stdout ', stdout);
                            console.log('stderr ', stderr);
                        });
          					}
          					resolve();

      				});

  		},errHandler).then(function(){
				console.log("insert container ports");
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
console.log("Ending now..............",dateTime.create().format('Y-m-d H:M:S'));
      				res.ren
  				},errHandler);

/*
-------------- TO DO ---------------------------
docker pull 159.89.234.84:5000/my-python;
7. Print reservation connection info
8. Security for ssh
*/
    // Insert the data into database and spinup the container.

		})
})
module.exports = router;
