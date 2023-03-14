const express = require('express');
const router = express.Router();

/** */
function Router(services) {
  const { opentok, startCaptions, stopCaptions } = services;

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

      res.json({});
    } catch (e) {
      next(e)
    }
  });

  return router;
}

module.exports = Router;