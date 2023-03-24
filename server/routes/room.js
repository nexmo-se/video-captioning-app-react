const express = require('express');
const router = express.Router();

function Router(services) {
  const { opentok, state } = services;

  /** */
  router.get('/:roomId', async function (req, res, next) {
    try {
      let { roomId } = req.params;
      let room = await state.getRoomById(roomId);
      if (!room) throw 'Not found room';
      res.json(room);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:roomId/token', async function (req, res, next) {
    try {
      let { roomId } = req.params;
      let room = await state.getRoomById(roomId);
      //if (!room) throw 'Not found room';
      if (!room) {
        const session = await opentok.createSession();
        console.log(`[router] - ${req.path} opentok.createSession`, session);
        room = await state.addRoom(roomId, session);
      }
      let token = opentok.generateToken(room.sessionId, { role: 'moderator' });
      res.json({
        ...room,
        apikey: process.env.OT_API_KEY,
        sessionId: room.sessionId,
        token: token,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}

module.exports = Router;