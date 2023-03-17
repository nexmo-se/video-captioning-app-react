require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const services = require('./services');
const indexRouter = require('./routes');

const app = express();

app.use(logger('dev', { skip: (req) => {
  const regex = /^(\/.*\/)/;
  const found = req.path.match(regex);
  return found
    ? ['/js/', '/_/'].includes(found[0]) 
    : ['/favicon.ico', '/', '/api/room/room-1/token'].includes(req.path);
}}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use('/', indexRouter(services));

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
