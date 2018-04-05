const express = require('express');
const app = express();
var NODE_SSH = require('node-ssh');


ssh = new NODE_SSH();


app.get('/', (req, res) => {
    console.log('Hello from the index');

    var data = req.body;

    ssh.connect({
      host: '159.89.234.84',
      username: 'root',
      privateKey: '/home/bhushan/.ssh/id_rsa'
    }).then( function() {
      //
      ssh.execCommand('docker run hello-world', { cwd:'/root' }).then(function(result) {
        console.log('STDOUT: ' + result.stdout)
      })
    })
})


// Used for creating a reservation
app.post('/reserve', (req, res) {
    let data = req.body;
    // type of user i.e C1, C2 etc
    // service requested
    // start and end time
})

app.post('/delete', (req, res) {
    let data = req.body;
    //only delete if the container exists and userid matches.
})

app.get('/listAllContainer', (req, res) {
    // This is from ADMIN perspective.
})


app.get('/setup', (req, res) => {
    console.log('setting up docker on compute nodes');
    ssh.connect({
      host: '159.89.234.84',
      username: 'root',
      privateKey: '/home/bhushan/.ssh/id_rsa'
    }).then( function() {
      ssh.execCommand('echo $PATH', { cwd:'/root' }).then(function(result) {
        console.log('STDOUT: ' + result.stdout)
      })
    })
})
app.listen(3000);
console.log('Running on port 3000...');
