'use strict';

const debug = require('debug')('queue');
const endMw = require('express-end');

const MiniQueue = require('mini-queue');


const expressQueueMw = function (config) {

  debug('Initializing: config:', config);

  const self = {};
  const rejectHandler = config.rejectHandler || defaultRejectHandler;

  self.createMiniQueue = function (config) {
    const miniQueue = new MiniQueue(config);

    // When any task has gone to `process` state,
    // wait for `end` event of `res` object (`job.data.res`)
    // then leave the `process` state
    miniQueue.on('process', function (job, done) {
      //job.data.res.removeAllListeners('end'); // Remove listener which was set in on(queued) event
      job.data.res.once('end', function () {     // `end` event is sent on res.end() by `express-end` middleware package
        done();
      });
      job.data.next();
    });

    miniQueue.on('reject', function (job) {
      debug('Rejected ' + job.data.req.path);
      rejectHandler(job.data.req, job.data.res);
    });



    return miniQueue;

  }

  self.queueMw = function (req, res, next) {

    const data = { req: req, res: res, next: next };
    const fieldValue = config.field ? (req.body || {})[config.field] || (req.params || {})[config.field] || (req.query || {})[config.field] : null;

    if (fieldValue) {
      if(!self.jobQueue) self.jobQueue = {};
      if (!self.jobQueue[fieldValue]) self.jobQueue[fieldValue] = self.createMiniQueue(config);

      const job = self.jobQueue[fieldValue].createJob(data);

      // Set listeners for logging
      res.once('close', function () { job.log('resOnClose'); }); // Closed from remote end
      res.once('end', function () { job.log('resOnEnd'); }); // Sent on res.end() by express-end
      res.once('finish', function () { job.log('resOnFinish'); });

      // Handle disconnect from client while in queue
      res.once('close', function () {
        if (job.status === 'queue') {
          // Return HTTP 204 No Content
          // - it must not be sent as the connection is already close by Client
          job.data.res.status(204).end();
          self.jobQueue[fieldValue]._cancelJob(job);
        }
      });

    } else {

      if (!self.jobQueue)
        self.jobQueue = self.createMiniQueue(config);

      const job = self.jobQueue.createJob(data);

      // Set listeners for logging
      res.once('close', function () { job.log('resOnClose'); }); // Closed from remote end
      res.once('end', function () { job.log('resOnEnd'); }); // Sent on res.end() by express-end
      res.once('finish', function () { job.log('resOnFinish'); });

      // Handle disconnect from client while in queue
      res.once('close', function () {
        if (job.status === 'queue') {
          // Return HTTP 204 No Content
          // - it must not be sent as the connection is already close by Client
          job.data.res.status(204).end();
          self.jobQueue._cancelJob(job);
        }
      });
    }

  };

  // merge `end` and `queue` middlewares
  const resultMw = function (req, res, next) {
    endMw(req, res, function () {     // Inject res.end() handler to emit 'end' event
      self.queueMw(req, res, next); // Use this middleware
    });
  };

  //TODO: Bu kısım default çalışmalı!
  // expose queue
  // resultMw.queue = self.jobQueue;

  return resultMw;
};

function defaultRejectHandler(req, res) {
  res.status(503).send('Service Unavailable');
}

module.exports = expressQueueMw;

