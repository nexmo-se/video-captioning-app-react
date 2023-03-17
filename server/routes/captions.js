const express = require('express');
const router = express.Router();

/** */
function Router(services) {
  const { opentok, startCaptions, stopCaptions, sendSignal } = services;

  router.all('/start/:sessionId', async function (req, res, next) {
    try {
      let sessionId = req.params.sessionId || null;
      if (!sessionId) throw "empty params sessionId";

      let captionsId = req.app.get(`captionsId-${sessionId}`);
      if (captionsId && captionsId !== null) return res.json({ captionsId });

      let data = await startCaptions(sessionId);
      console.log(`[router] ${req.path} startCaptions`, data);

      let cId = data.captionsId || null;
      req.app.set(`captionsId-${sessionId}`, cId);

      await sendSignal(sessionId, 'captions:started');

      res.json(data);
    } catch (e) {
      next(e)
    }
  });

  router.all('/stop/:sessionId', async function (req, res, next) {
    try {
      let sessionId = req.params.sessionId || null;
      if (!sessionId) throw "empty params sessionId";
      
      let captionsId = req.app.get(`captionsId-${sessionId}`);
      if (captionsId && captionsId !== null) await stopCaptions(captionsId);

      req.app.set(`captionsId-${sessionId}`, null);
      
      await sendSignal(sessionId, 'captions:stopped');

      return res.json({ captionsId: null });
    } catch (e) {
      next(e)
    }
  });

  router.all('/status/:sessionId', async function (req, res, next) {
    try {
      let sessionId = req.params.sessionId || null;
      if (!sessionId) throw "empty params sessionId";

      let captionsId = req.app.get(`captionsId-${sessionId}`);
      if (captionsId && captionsId !== null) return res.json({ captionsId });

      return res.json({ captionsId: null });
    } catch (e) {
      next(e)
    }
  });

  return router;
}

module.exports = Router;