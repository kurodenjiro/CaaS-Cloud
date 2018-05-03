var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var main = require('../app');
const exec = require('child_process').exec;

var con = mysql.createConnection({
  host: "localhost",
  user: "caas",
  password: "csc547",
  database: "csc547caas"
});

router.post('/', function(req, res) {
    console.log('Delete');
    console.log(req.body);

    let mgmtid=1;
    let compute_ip;
    let localpath;
    let remotepath;

	var errHandler = function(err) {
	  	console.log(err);
	}
	return new Promise(function(resolve, reject) {
	    con.connect(function(err) {
	        let statequery = "UPDATE container SET state='deleted',res_end_time=NOW() WHERE conid="+req.body.conid;
	        con.query(statequery, function(err, rows, fields){
	            if(err) reject(err);
	            resolve();
	        })
	    })
	}).then(function(){
	    let natquery = "select MGMT.public_ip,NATTUPLE.* from (select container_ports.mgmtid,container_ports.natport,computer.private_ip,container_ports.comport,container_ports.import from container,computer,container_ports WHERE computer.comid=container.comid AND container_ports.conid=container.conid AND container.conid="+req.body.conid+ ") AS NATTUPLE,computer MGMT WHERE MGMT.comid=NATTUPLE.mgmtid";
	    return new Promise(function(resolve,reject){
		    con.query(natquery,function(err,natrows,fields){
		    	if(err) reject(err);
		    	resolve(natrows);
		    })
	    })
	},errHandler).then(function(natrows){
		console.log("DELETE IP Tables function");
	    // IPtables Nat rules
	    return new Promise(function(resolve, reject) {
	        //SSH and add IPtables rules
	        console.log("came here",natrows);
	        for (var i = 0; i < natrows.length; i++) {
	        	compute_ip=natrows[0].private_ip;
	            let sshCmd = 'iptables -t nat -D PREROUTING -d '+ natrows[i].public_ip +'/24 -p tcp --dport '+ natrows[i].natport +' -j DNAT --to-destination '+ natrows[i].private_ip +':'+ natrows[i].comport;
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
                let storagequery =  "select * from storage WHERE conid="+req.body.conid;
            return new Promise(function(resolve,reject){
                    con.query(storagequery,function(err,storagerow,fields){
                        if(err) reject(err);
			if(storagerow && storagerow[0] && storagerow[0].remote_path)
			{
				localpath = storagerow[0].local_path;
				remotepath = storagerow[0].remote_path;
			}
                        resolve();
                    })
            })
        },errHandler).then(function(){
		let conhashquery =  "select conhash from container WHERE conid="+req.body.conid;
	    return new Promise(function(resolve,reject){
		    con.query(conhashquery,function(err,conhashrow,fields){
		    	if(err) reject(err);
		    	resolve(conhashrow[0].conhash);
		    })
	    })
	},errHandler).then(function(conhash){
	    return new Promise(function(resolve, reject) {
	    	ssh.connect({
                host: compute_ip,
	            username: 'root',
                privateKey: '/home/csc547/.ssh/id_rsa'
	        }).then( function() {
		let sshCmd;
	            sshCmd = 'docker stop '+ conhash +' && sleep 30s &&  docker rm '+ conhash;
			if(remotepath)
                	{
                        	sshCmd += '; docker-machine mount -u dev:'+remotepath+' '+localpath+'; rmdir '+localpath;
                	}
			console.log(sshCmd);
	            ssh.execCommand(sshCmd, { cwd:'/root' }).then(function(result) {
	              console.log(result.stdout);
	              resolve();
	            });
	        });
	    })
	},errHandler).then(function(){
	    let delquery = "DELETE from container_ports WHERE conid="+req.body.conid;
	    return new Promise(function(resolve,reject){
		    con.query(delquery,function(err,natrows,fields){
		    	if(err) console.log(err);
		    	console.log("Delete Successful");
		    })
	    })
	},errHandler);

});

module.exports = router;
