var socket = require('socket.io-client')('http://localhost:8080');
var os = require('os');
// var io = require('socket.io').listen(server);
socket.on('connect', function(){
    console.log('connected to server');
    setInterval(function() {
      //var info = 'Type:' + os.type() + 'Memory:'+ os.freemem()/(1024*1024);
      var freemem = os.freemem()/(1024*1024);
      var uptime = os.uptime();
      var avgLoad = os.loadavg();
      var cores = os.cpus().length;
      var totalmem = os.totalmem()/(1024*1024);
      socket.emit('msg', freemem, totalmem,uptime, avgLoad[0], cores);
    },2000);

});
