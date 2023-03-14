const express = require('express');
const router = express.Router();

const captionsRouter = require('./captions');
const monitorRouter = require('./monitor');

const OT_API_KEY = process.env.OT_API_KEY;

function Router(services) {
  const { opentok } = services;

  /** */
  router.get('/api/room/:roomId/token', function (req, res, next) {
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

  return router;
}

module.exports = Router;