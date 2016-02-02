'use strict';

var debug = require('debug')('queue');
var end = require('express-end');


var QueueJob = function(id, data) {
  var self = this;
  self.id = id;
  self.data = data;
};


var expressQueue = function(config) {

  debug('Initializing: config:', config);

  config = config || {};
  config.activeLimit = config.activeLimit || 0;

  var self = {};

  self.totalCount  = 0;
  self.activeCount = 0;
  var queue = [];

  self.createJob = function(data) {
    self.totalCount++;
    var job =  new QueueJob(self.totalCount, data);
    debug('createJob [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    return job;
  };

  self.startJob = function(job) {
    self.activeCount++;
    debug('startJob [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    job.data.next();
  };

  self.terminateJob = function(/*job*/) {
    throw 'Not implemented';
  };

  self.onJobFinish = function(job) {
    self.activeCount--;
    debug('onJobFinish [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    process.nextTick(self.checkQueue);
    //self.checkQueue();
  };

  self.onJobCancel = function(job) {
    debug('onJobCancel [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    self.terminateJob(job);
  };

  self.putJob = function(job) {
    queue.push(job);
    debug('putJob [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
  };

  self.getJob = function popJob() {
    var job = queue.shift();
    debug('getJob [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    return job;
  };

  self.checkQueue = function check() {
    if ((self.activeCount < config.activeLimit || config.activeLimit === 0) && queue.length > 0) {
      var job = self.getJob();
      self.startJob(job);
    }
  };

  self.queueMw = function(req,res,next) {

    var data = { req: req, res: res, next: next };
    var job = self.createJob(data);

    var resOnClose = function() {
      debug('resOnClose [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    };

    var resOnEnd = function() {
      debug('resOnEnd [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
      self.onJobFinish(job);
    };

    var resOnFinish = function() {
      debug('resOnFinish [%d] status: (%d/%d)', job.id, self.activeCount, queue.length);
    };

    res.once('close',  resOnClose); // Closed from remote end
    res.once('end',    resOnEnd);   // Sent on res.end() by express-end
    res.once('finish', resOnFinish);

    if ((self.activeCount < config.activeLimit) || (config.activeLimit === 0)) {
      self.startJob(job);
    } else {
      self.putJob(job);
    }

  };

  return function(req, res, next) {
    end(req, res, function () {
      self.queueMw(req, res, next);
    });
  };

};


module.exports = expressQueue;

