
const PORT = process.env.PORT || 3002;
const APP_URL = process.env.APP_URL;
const SESSION_ID = process.env.SESSION_ID;
const OT_API_KEY = process.env.OT_API_KEY;
const OT_API_SECRET = process.env.OT_API_SECRET;
if (!OT_API_KEY || !OT_API_SECRET) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}

/** */
const jwt = require('jsonwebtoken');
const axios = require('axios');
const OpenTok = require('opentok');

const opentok = new OpenTok(OT_API_KEY, OT_API_SECRET);

/** */
const createSession = function () {
  if (SESSION_ID) {
    return Promise.resolve({
      sessionId: SESSION_ID
    });
  }
  
  const options = {
    mediaMode: "routed"
  };

  return new Promise((resolve, reject) => {
    opentok.createSession(options, function (err, session) {
      if (err) return reject(err);
      resolve(session);
    });
  });
}

const generateJwt = function (expire = 300) {
  var currentTime = Math.floor(new Date() / 1000);
  var token = jwt.sign({
    iss: OT_API_KEY,
    ist: 'project',
    iat: currentTime,
    exp: currentTime + expire
  }, OT_API_SECRET);
  return token;
};

const startCaptions = async function(sessionId) {
  try {
    console.log("startCaptions", sessionId);

    const url = `https://api.opentok.com/v2/project/${OT_API_KEY}/captions`;
    const jwt = generateJwt();
    const headers = {
      'Content-Type': 'application/json',
      'X-OPENTOK-AUTH': jwt
    };
    const token = opentok.generateToken(sessionId, {role: 'moderator'});
    const payload = {
      'sessionId': sessionId,
      'token': token,
      'languageCode': 'en-US',
      'maxDuration': 1800,
      'partialCaptions': true,
      'statusCallbackUrl': `${APP_URL}/monitor/session`
    };
    const { data } = await axios.post(url, payload, { headers });
    return data;
  } catch (error) {
    console.log('[startCaptions] - error', error.message);
    throw `start Captions - ${ error.message || 'failed'}`;
  }
}

const stopCaptions = async function(captionsId) {
  try {
    const url = `https://api.opentok.com/v2/project/${OT_API_KEY}/captions/${captionsId}/stop`;
    const jwt = generateJwt();
    const headers = {
      'Content-Type': 'application/json',
      'X-OPENTOK-AUTH': jwt
    };
    const payload = null;
    const { data } = await axios.post(url, payload, { headers });
    return data;
  } catch (error) {
    console.log('[stopCaptions] - error', error.message);
    throw `stop Captions - ${ error.message || 'failed'}`;
  }
}

const sendSignal = async function (sessionId, type, data) {
  return new Promise((resolve, reject) => {
    const payload = { type, data };
    payload.data = payload.data || '';
    if (typeof payload.data === 'object') payload.data = JSON.stringify(payload.data);
    opentok.signal(sessionId, null, payload, function (err) {
      if (err) {
        console.log(err.message);
        // reject(err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/** */
const start = async (app) => {
  try {
    console.log('[] app');

    const session = await createSession();
    console.log('[] createSession', session.sessionId);
    
    app.set('sessionId', session.sessionId);

    app.listen(PORT, function () {
      console.log(`[] listening on http://localhost:${PORT}/`);
    });
  } catch (e) {
    console.log('[] - error', e);
    process.exit(1);
  }
};

module.exports = {
  startCaptions,
  stopCaptions,
  opentok,
  start,
  sendSignal,
  generateJwt
};
