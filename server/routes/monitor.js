const express = require('express');
const router = express.Router();

function Router(services) {
  const { sendSignal } = services;

  router.all('/*', async function (req, res, next) {
    try {
      console.log(JSON.stringify(req.body, null, 2));
    
      const sessionId = req.body.sessionId || null;
      const captionsId = req.body.captionsId || null;
      const status = req.body.status || null;

      if (captionsId && sessionId) {
        await sendSignal(sessionId, `captions:${status}`);
        if (status === "stopped") req.app.set(`captionsId-${sessionId}`, null);
      }

      res.sendStatus(200);
    } catch (e) {
      next(e)
    }
  });

  return router;
}

module.exports = Router;
