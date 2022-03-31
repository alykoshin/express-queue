'use strict';


const debug   = require('debug')('app');
const express = require('express');
const http    = require('http');

//var queue = require('express-queue');
const expressQueue = require('../');

const httpPort = 8080;

const app = express();

// Using queue middleware
const queueMw = expressQueue({ activeLimit: 2, queuedLimit: 6 });
app.use(queueMw);
// May be also:
// app.use(queue({ activeLimit: 2, queuedLimit: -1 }));
// - or -
// app.use('/test1', queue({ activeLimit: 2 }) );

const RESPONSE_DELAY = 1000; // Milliseconds

let counter = 0;

app.get('/test1', function (req, res) {
  let cnt = counter++; // local var inside the closure
  console.log(`get(test1): [${cnt}/request] queueLength: ${queueMw.queue.getLength()}`);

  const result = { test: 'test' };

  setTimeout(function() {
    console.log(`get(test1): [${cnt}/ready] queueLength: ${queueMw.queue.getLength()}` );
    res
      .status(200)
      .send(result);
    console.log(`get(test1): [${cnt}/sent] queueLength: ${queueMw.queue.getLength()}`);
  }, RESPONSE_DELAY);

});


const server = http.createServer(app);

server.listen(httpPort, function () {
  console.log(`* Server listening at ${server.address().address}:${server.address().port}`)
});

