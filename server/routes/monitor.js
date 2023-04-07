const express = require('express');
const router = express.Router();

function Router(services) {
  const { opentok, state } = services;

  router.all('/*', async function (req, res, next) {
    try {
      console.log(JSON.stringify(req.body, null, 2));
    
      const sessionId = req.body.sessionId ?? null;
      const captionsId = req.body.captionsId ?? null;
      const status = req.body.status ?? null;

      if (captionsId && sessionId) {
        const room = await state.getRoomBySessionId(sessionId);
        if (!room) return res.sendStatus(200);

        await opentok.sendSignal(sessionId, `captions:${status}`);

        if (status === 'stopped') {
          const room = await state.getRoomBySessionId(sessionId);
          (room && await state.setCaptionsId(room.id, null));
        };
      }

      res.sendStatus(200);
    } catch (e) {
      next(e)
    }
  });

  return router;
}

module.exports = Router