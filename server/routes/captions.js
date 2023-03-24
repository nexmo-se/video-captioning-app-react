const express = require('express');
const router = express.Router();

/** */
function Router(services) {
  const { opentok, state } = services;

  router.all('/start/:sessionId', async function (req, res, next) {
    try {
      let { sessionId } = req.params;
      if (!sessionId) throw "empty params sessionId";
      let room = await state.getRoomBySessionId(sessionId);
      if (!room) throw 'Not found room';

      if (room.captionsId) return res.json(room);

      let data = await opentok.startCaptions(sessionId, 
        {
          appUrl: req.app.get('appUrl')
        }
      );
      console.log(`[router] - ${req.path} opentok.startCaptions`, data);
      if (data.captionsId) room = await state.setCaptionsId(room.id, data.captionsId);

      await opentok.sendSignal(sessionId, 'captions:started');

      res.json(room);
    } catch (e) {
      next(e)
    }
  });

  router.all('/stop/:sessionId', async function (req, res, next) {
    try {
      let { sessionId } = req.params;
      if (!sessionId) throw "empty params sessionId";
      let room = await state.getRoomBySessionId(sessionId);
      if (!room) throw 'Not found room';

      if (room.captionsId) await opentok.stopCaptions(room.captionsId);

      room = await state.setCaptionsId(room.id, null);

      await opentok.sendSignal(sessionId, 'captions:stopped');

      res.json(room);
    } catch (e) {
      next(e)
    }
  });

  return router;
}

module.exports = Router;