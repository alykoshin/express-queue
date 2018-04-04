//import expressQueueMw from 'express-queue';
const expressQueueMw = require('../../../../../../../index');
//import chainCtrl from './chain.controller';
const chainCtrl = require('./chain.controller');
const Router = require('express').Router;


const delayedResponse = (req, res) => {
  console.log('delayedResponse: enter');
  setTimeout(() => {
    console.log('delayedResponse: done');
    res.send('delayedResponse: done');
  }, 10000);
};

const router = Router(); // eslint-disable-line new-cap
router.route('/init').get(chainCtrl.init, expressQueueMw({ activeLimit: 1 }), delayedResponse);
//router.route('/init').get(delayedResponse);

//export default router;
module.exports = router;
