require('dotenv').config();
const express = require('express');
const logger = require('morgan');

const services = require('./services');
const indexRouter = require('./routes');

const app = express();

app.use(logger('dev', { skip: (req) => {
  const regex = /^(\/.*\/)/;
  const found = req.path.match(regex);
  return found
    ? ['/js/', '/_/', '/api/room/'].includes(found[0]) 
    : ['/favicon.ico', '/', '/api/room/room-1/token'].includes(req.path);
}}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get("/_/health", async (req, res) => {
  res.sendStatus(200);
});

app.use('/', indexRouter(services));

app.all('*', async function (req, res, next) {
  res.sendFile((__dirname + '/public/index.html'));
});

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  console.log(err);
  let error = app.get('env') === 'development' ? err : { message: 'Something is wrong' };
  res.status(err.status || 500);
  res.json(error);
});

services.start(app);
