//import routes from './server/routes/index.routes';
const routes = require('./server/routes/index.routes');

//...config
const express = require('express');
const http    = require('http');
const app = express();
const httpPort = 8080;

app.use('/', routes);

//...config
const server = http.createServer(app);

server.listen(httpPort, function () {
  console.log(`* Server listening at ${server.address().address}:${server.address().port}`)
});
