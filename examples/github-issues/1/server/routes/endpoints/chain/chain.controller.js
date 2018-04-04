module.exports = {
  init: (req, res, next) => {
    console.log('chain.controller');
    //res.send('chain.controller');
    next();
  }
}
