var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var main = require('../app');

var con = mysql.createConnection({
    host: "159.89.234.84",
    user: "pavi",
    password: "csc547",
    database: "csc547caas"
});

let c = {};
con.connect();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

router.get('/', function(req, res) {
    var errHandler = function(err) {
        console.log(err);
    }

    return new Promise(function(resolve, reject) {
        con.query("SELECT DISTINCT(computer.comid),computer.private_ip FROM computer,container WHERE container.comid = computer.comid AND container.state='available'", function(err, result, fields) {
            if (err) {
                console.log(err);
                throw reject(err);
            }
            resolve(result);

        });
    }).then(function(result) {
        for (var i = 0; i < result.length; i++) {
            var conquery = "SELECT container.conhash,computer.private_ip FROM container,computer where computer.comid = container. comid and container.comid=" + result[i].comid + " AND container.state='available'";
            c[result[i].private_ip] = {}
            return new Promise(function(resolve, reject) {
                con.query(conquery, function(err, conhashrows, fields) {
                    if (err) reject(err);
                    resolve(conhashrows);
                });
            }).then(function(conhashrows) {
                let count = 0;
                return new Promise(function(resolve, reject) {
                    for (var j = 0; j < conhashrows.length; j++) {

                        let sshCmd = "docker inspect " + conhashrows[j].conhash;
                        console.log(sshCmd);

                        return new Promise(function(resolve, reject) {
                            console.log('Inside promise');
                            ssh.connect({
                                host: '159.89.234.84', //conhashrows[j].private_ip,
                                username: 'root',
                                privateKey: '/home/bhushan/.ssh/id_rsa'
                            }).then(async function() {
                                console.log('Connected')
                                await sleep(250);
                                let exec = ssh.execCommand(sshCmd, {cwd: '/root'});
                                let exit = ssh.execCommand('exit', {cwd: '/root'});

                                exec.then(function(result) {
                                    console.log('Resolving data');
                                    resolve(JSON.parse(result.stdout)[0]['State']['Status']);
                                    return exit;

                                }).then(function() {
                                    console.log('Exit Success');
                                })

                            })

                        }).then(function(status) {
                            console.log('Hi', status, j);
                            c[conhashrows[j].private_ip][conhashrows[j].conhash] = status;
                            if (j == conhashrows.length -1) {
                                console.log('Last round');
                                resolve(c);
                            }

                            // console.log(c);
                            // resolve(status);

                        }, errHandler);
                    }
                    // console.log('For loop is over', c);
                    // resolve(c);
                }).then(function(result) {
                    console.log('This is final dictionary after running for loop', result);
                    console.log('We are ready to render the page now.')
                })
            })
        }

    }, errHandler);
});

module.exports = router;
