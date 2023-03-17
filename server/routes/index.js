const express = require('express');
const router = express.Router();

const captionsRouter = require('./captions');
const monitorRouter = require('./monitor');

const OT_API_KEY = process.env.OT_API_KEY;

function Router(services) {
  const { opentok, sendSignal, generateJwt } = services;

  /** */
  router.get('/api/room/:roomId/token', async function (req, res, next) {
    try {
      const sessionId = req.app.get('sessionId');
      const token = opentok.generateToken(sessionId, {role: 'moderator'});
      res.json({
        apikey: OT_API_KEY,
        sessionId: sessionId,
        token: token
      });
    } catch (e) {
      next(e)
    }
  });

  /** */
  router.use('/api/captions', captionsRouter(services));
  router.use('/monitor', monitorRouter(services));

  router.use('/', async function (req, res, next) {
    res.sendStatus(200);
  });

  return router;
}

module.exports = Router;