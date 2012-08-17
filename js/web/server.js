var http        = require('http');
var sockjs      = require('sockjs');
var node_static = require('node-static');
var testEvents  = require('../setup/example1and2.js');
var testRes     = require('../setup/LeaseObjRes.js');


// 1. Echo sockjs server
var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};

var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.on('connection', function(conn) {
  conn.write('JSON'+JSON.stringify(testEvents));
  conn.write('JSON'+JSON.stringify(testRes));
  conn.on('data', function(message) {
    conn.write(message);
  });
});

// 2. Static files server
var static_directory = new node_static.Server(__dirname);

// 3. Usual http stuff
var server = http.createServer();
server.addListener('request', function(req, res) {
  static_directory.serve(req, res);
});
server.addListener('upgrade', function(req,res){
  res.end();
});

sockjs_echo.installHandlers(server, {prefix:'/echo'});

console.log(' [*] Listening on 0.0.0.0:9999' );
server.listen(9999, '0.0.0.0');



//TODO:
//return the event renderer and result renderer
