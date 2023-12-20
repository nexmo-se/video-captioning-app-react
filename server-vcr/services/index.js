const OT_API_KEY = process.env.OT_API_KEY;
const OT_API_SECRET = process.env.OT_API_SECRET;
if (!OT_API_KEY || !OT_API_SECRET) {
  console.log('You must specify OT_API_KEY and OT_API_SECRET environment variables');
  process.exit(1);
}

const PORT = process.env.PORT || 3002;

/** */
const { neru } = require("neru-alpha");
const opentok = require("./opentok")();
const state = require("./state")(neru);

/** */
const start = async (app) => {
  try {
    console.log('[start] -');

    app.set('appUrl', neru.getAppUrl());
    // app.set('appUrl', process.env.APP_URL);

    const session = process.env.SESSION_ID
      ? { sessionId: process.env.SESSION_ID }
      : await opentok.createSession();
    console.log('[start] - session', session);
    
    await state.initRooms([session]);

    app.listen(PORT, function () {
      console.log(`[start] - listening on ${PORT} `);
    });
  } catch (e) {
    console.log('[start] - error', e);
    process.exit(1);
  }
};

module.exports = {
  start,
  opentok,
  state,
};
