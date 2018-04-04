//import { Router } from 'express';
const Router = require('express').Router;
//import expressQueueMw from 'express-queue';
//const expressQueueMw = require('../../../../../index');

//import chainRoutes from './endpoints/chain/chain.routes';
const chainRoutes = require('./endpoints/chain/chain.routes');

const router = Router(); // eslint-disable-line new-cap

// mount chaincode routes at /chain
router.use('/api/chain', chainRoutes);

//export default router;
module.exports = router;
