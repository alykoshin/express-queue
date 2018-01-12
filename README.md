[![npm version](https://badge.fury.io/js/express-queue.svg)](http://badge.fury.io/js/express-queue)
[![Build Status](https://travis-ci.org/alykoshin/express-queue.svg)](https://travis-ci.org/alykoshin/express-queue)
[![Coverage Status](https://coveralls.io/repos/alykoshin/express-queue/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/express-queue?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/express-queue/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/express-queue)
[![Inch CI](https://inch-ci.org/github/alykoshin/express-queue.svg?branch=master)](https://inch-ci.org/github/alykoshin/express-queue)

[![Dependency Status](https://david-dm.org/alykoshin/express-queue/status.svg)](https://david-dm.org/alykoshin/express-queue#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/express-queue/dev-status.svg)](https://david-dm.org/alykoshin/express-queue#info=devDependencies)

[![Known Vulnerabilities](https://snyk.io/test/github/alykoshin/express-queue/badge.svg)](https://snyk.io/test/github/alykoshin/express-queue)


# express-queue

Express middleware to limit a number of simultaneously processing  requests using queue


If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/express-queue/issues).


## Installation

```sh
npm install --save express-queue
```

## Usage

```js
var express = require('express');
var queue = require('express-queue');
var app = express();

// Using queue middleware
app.use(queue({ activeLimit: 2, queuedLimit: -1 }));
// activeLimit - max request to process simultaneously
// queuedLimit - max requests in queue until reject (-1 means do not reject)
//
// May be also:
// app.get('/api', queue({ activeLimit: 2, queuedLimit: -1})
```

## Example

Please, refer to `./examples/` directory for a working example.


## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/express-queue) &nbsp; [npmjs.com](https://www.npmjs.com/package/express-queue) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/express-queue) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/express-queue) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/express-queue)


## License

MIT
