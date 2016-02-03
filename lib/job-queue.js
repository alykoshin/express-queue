/**
 * Created by alykoshin on 03.02.16.
 */

'use strict';

var EventEmitter = require('events');
var util = require('util');
var debug = require('debug')('queue');

/*

 QueueJob State Diagram
 ======================

 +------------+
 | new        |
 |            |
 +---+----+---+
     |    |
     |    +---+
     |        |
     |  +-----v------+
     |  | queued     |
     |  |            |
     |  +-----+------+
     |        |
     |        |
     |        |
     |  +-----v------+   +------------+
     |  | dequeued   +---> cancelled  |
     |  |            |   |            |
     |  +-----+------+   +------------+
     |        |
     |    +---+ _startJob()
     |    |
 +---v----v---+          +------------+
 | started    +----------> terminated |
 |            |          |(not implem)|
 +-----+------+          +------------+
       |
       |
       |
 +-----v------+
 | completed  |
 |            |
 +------------+

 */

var QueueJob = function(id, queue, data) {
  var self = this;
  EventEmitter.call(this);

  self.id = id;
  self.queue = queue;
  self.data = data;
  self.state = 'new';

  self.log = function(/*arguments*/) {
    var args = Array.prototype.slice.call(arguments);
    var s = args.shift() || '';
    s = util.format('[%d] %s', self.id, s);
    args.unshift(s);
    self.queue.log.apply(this, args);
  };
};
util.inherits(QueueJob, EventEmitter);


var JobQueue = function(config) {
  var self = this;
  EventEmitter.call(this);

  config             = config || {};
  config.activeLimit = config.activeLimit || 0;
  config.queuedLimit = config.queuedLimit || 0;

  self.activeCount = 0;
  self.totalCount  = 0;
  var queue        = [];

  self.getLength = function() {
    return queue.length;
  };

  self.log = function(/*arguments*/) {
    var args = Array.prototype.slice.call(arguments);
    var s = args.shift() || '';
    s = util.format('(%d/%d %d/%d %d) %s', self.activeCount, config.activeLimit, self.getLength(), config.queuedLimit, self.totalCount, s);
    args.unshift(s);
    debug.apply(this, args);
  };

  //self.byId = function(jobId) {
  //  for (var len=queue.length, i=0; i<len; ++i) {
  //    if(queue[i].id === jobId) {
  //      return queue[i].id;
  //    }
  //  }
  //  return null;
  //};

  self.createJob = function(data) {
    self.totalCount++;
    if (self.totalCount >= Number.MAX_SAFE_INTEGER) { self.totalCount = 0; }
    var job =  new QueueJob(self.totalCount, self, data);
    job.log('createJob()');

    // All processing to be handled on nextTick to allow to set listeners after creation
    process.nextTick(function() {
      if (self._canStart() && queue.length === 0) {
        self._startJob(job);
      } else {
        self._queueJob(job);
      }
    });
    //process.nextTick(self._checkQueue);
    //self._checkQueue();

    return job;
  };

  self._queueJob = function(job) {
    queue.push(job);
    job.status = 'queued';
    job.log('_queueJob()');
    job.emit('dequeued', function(err, result) {
      self._onJobCancel(job, err, result);
    });
    self.emit('queued', job, function(err, result) {
      self._onJobCancel(job, err, result);
    });
  };

  self._dequeueJob = function() {
    var job = queue.shift();
    job.status = 'dequeued';
    job.log('_dequeueJob()');
    job.emit('dequeued');
    self.emit('dequeued', job);
    return job;
  };

  self._startJob = function(job) {
    self.activeCount++;
    job.status = 'started';
    job.log('_startJob()');
    job.emit('process', function(err, result) {
      self._onJobComplete(job, err, result);
    });
    self.emit('process', job, function(err, result) {
      self._onJobComplete(job, err, result);
    });
    //job.data.next();
  };

  self._onJobComplete = function(job, err, result) {
    self.activeCount--;
    job.status = 'comlpeted';
    job.log('_onJobComplete(): err: %j, result: %j', err, result);
    job.emit('complete', err, result);
    self.emit('complete', job, err, result);
    process.nextTick(self._checkQueue);
    //self._checkQueue();
  };

  self._terminateJob = function(/*job*/) {
    throw 'Not implemented';
  };

  self._onJobCancel = function(job) {
    job.log('_onJobCancel()');
    self._cancelJob(job);
  };

  self._cancelJob = function(job) {
    job.status = 'cancelled';
    var i = queue.indexOf(job);
    if (i < 0) {
      self.log('_cancelJob(): job [%d] not found', job.id);
    } else {
      queue.splice(i, 1);
      job.log('_cancelJob(): index: %d', i);
    }
    job.emit('cancel');
    self.emit('cancel', job);
  };

  self._canStart = function() {
    return self.activeCount < config.activeLimit || config.activeLimit === 0;
  };

  self._checkQueue = function check() {
    if (self._canStart() && queue.length > 0) {
      var job = self._dequeueJob();
      self._startJob(job);
    }
  };

  self.log('Created with config:', config);

};
util.inherits(JobQueue, EventEmitter);


module.exports = JobQueue;
