'use strict';

var debug = require('debug')('queue');
var end = require('express-end');

var JobQueue = require('./job-queue');


var expressQueueMw = function(config) {

  debug('Initializing: config:', config);

  var self = {};

  self.jobQueue = new JobQueue(config);

  self.jobQueue.on('process', function(job, done) {
    //job.data.res.removeAllListeners('end'); // Remove listener which was set in on(queued) event
    job.data.res.once('end', function() {     // Sent on res.end() by express-end
      done();
    });
    job.data.next();
  });

  self.queueMw = function(req,res,next) {

    var data = { req: req, res: res, next: next };
    var job = self.jobQueue.createJob(data);

    // Set listeners for logging
    res.once('close',  function() { job.log('resOnClose');  }); // Closed from remote end
    res.once('end',    function() { job.log('resOnEnd');    }); // Sent on res.end() by express-end
    res.once('finish', function() { job.log('resOnFinish'); });

    // Handle disconnect from client while in queue
    res.once('close',  function() {
      if (job.status === 'queued') {
        // Return HTTP 204 No Content
        // - it must not be sent as the connection is already close by Client
        job.data.res.status(204).end();
        self.jobQueue._cancelJob(job);
      }
    });


  };

  return function(req, res, next) {
    end(req, res, function () {     // Inject res.end() handler to emit 'end' event
      self.queueMw(req, res, next); // Use this middleware
    });
  };

};


module.exports = expressQueueMw;

