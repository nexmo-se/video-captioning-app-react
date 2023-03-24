const express = require('express');
const router = express.Router();

const roomRouter = require('./room');
const captionsRouter = require('./captions');
const monitorRouter = require('./monitor');

function Router(services) {
  // const { opentok, state } = services;

  /** */
  router.use('/api/room', roomRouter(services));
  router.use('/api/captions', captionsRouter(services));
  router.use('/monitor', monitorRouter(services));

  /** */
  router.all('/', async function (req, res, next) {
    res.sendStatus(200);
  });

  return router;
}

module.exports = Router;
