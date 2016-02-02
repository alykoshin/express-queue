'use strict';


var express = require('express');
var http    = require('http');

//var queue = require('express-queue');
var queue = require('../');

var httpPort = 8080;


var app = express();

//
app.use(queue({ activeLimit: 2 }));


app.get('/test1', function (req, res) {
  console.log('get(test1): 1');

  var result = { test: 'test' };

  setTimeout(function() {
    console.log('get(test1): 2');
    res
      .status(200)
      .send(result);
    console.log('get(test1): 3');
  }, 1000);

});


var server = http.createServer(app);

server.listen(httpPort, function () {
  console.log('* Server listening at ' +
    server.address().address + ':' +
    server.address().port);
});

