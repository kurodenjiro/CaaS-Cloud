var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var main = require('../app');

var http = require('http');

var server = http.createServer(function(req, res) {
    // fs.readFile('./index.html', 'utf-8', function(error, content) {
    //     res.writeHead(200, {"Content-Type": "text/html"});
    //     res.end(content);
    console.log('Server has initiated');
});


var io = require('socket.io').listen(server);
var con = mysql.createConnection({
    host: "localhost",
    user: "caas",
    password: "csc547",
    database: "csc547caas"
});
var client1;
io.sockets.on('connection', function (socket) {
console.log('A client is connected!');
socket.on('msg', function(...args) {
    var d = {
        //hardcode IP: 'computeIPAddress'
        freemem: args[0],
        totalmem: args[1],
        uptime: args[2],
        avgLoad: args[3],
        cores: args[4]
    }
    client1 = d;
    console.log('Client says', ...args)

})
});
server.listen(8080);

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
                                host: conhashrows[j].private_ip,
                                username: 'root',
                                privateKey: '/home/csc547/.ssh/id_rsa'
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
                    let c = [];
                    // for (let key in result) {
                    //     c
                    // }
                    // var 'client1';

                    res.render('monitor', {container: result, computer: client1});



                })
            })
        }

    }, errHandler);
});

module.exports = router;
