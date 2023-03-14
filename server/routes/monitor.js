const express = require('express');
const router = express.Router();

function Router(services) {
  // const { opentok } = services;

  router.all('/*', function (req, res) {
    console.log(JSON.stringify(req.body, null, 2));
    
    const sessionId = req.body.sessionId || null;
    const captionsId = req.body.captionsId || null;

    if (captionsId && sessionId) {
      const status = req.body.status || null;
      if (status === "stopped") req.app.set(`captionsId-${sessionId}`, null);
    }

    res.sendStatus(200);
  });

  return router;
}

module.exports = Router;