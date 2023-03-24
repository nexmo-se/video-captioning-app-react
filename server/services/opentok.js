const CAPTION_MAX_DURATION = process.env.CAPTION_MAX_DURATION || 1800; // 30 mins
const CAPTION_LANG_CODE = process.env.CAPTION_LANG_CODE || 'en-US';
const CAPTION_PARTIAL = process.env.CAPTION_PARTIAL || true;

/** */
const jwt = require('jsonwebtoken');
const axios = require('axios');
const OpenTok = require('opentok');

const opentok = new OpenTok(process.env.OT_API_KEY, process.env.OT_API_SECRET);

module.exports = () => ({
  createSession () {
    return new Promise((resolve, reject) => {
      opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
        if (err) {
          console.log(`create Session ${ err.message || 'failed'}`);
          return reject(err);
        } else {
          resolve({ sessionId: session.sessionId });
        }
      });
    });
  },

  generateToken(sessionId, options) {
    return opentok.generateToken(sessionId, options);
  },

  generateJwt (expire = 300) {
    var currentTime = Math.floor(new Date() / 1000);
    var token = jwt.sign({
      iss: process.env.OT_API_KEY,
      ist: 'project',
      iat: currentTime,
      exp: currentTime + expire
    }, process.env.OT_API_SECRET);
    return token;
  },

  async startCaptions (sessionId, options) {
    try {
      const { appUrl } = options;
      const url = `https://api.opentok.com/v2/project/${process.env.OT_API_KEY}/captions`;
      const jwt = this.generateJwt();
      const headers = {
        'Content-Type': 'application/json',
        'X-OPENTOK-AUTH': jwt
      };
      const token = opentok.generateToken(sessionId, {role: 'moderator'});
      const payload = {
        'sessionId': sessionId,
        'token': token,
        'languageCode': CAPTION_LANG_CODE,
        'maxDuration': CAPTION_MAX_DURATION,
        'partialCaptions': CAPTION_PARTIAL,
        'statusCallbackUrl': `${appUrl}/monitor/session`
      };
      const { data } = await axios.post(url, payload, { headers });
      return data;
    } catch (err) {
      throw `start Captions - ${ err.message || 'failed'}`;
    }
  },

  async stopCaptions (captionsId) {
    try {
      const url = `https://api.opentok.com/v2/project/${process.env.OT_API_KEY}/captions/${captionsId}/stop`;
      const jwt = this.generateJwt();
      const headers = {
        'Content-Type': 'application/json',
        'X-OPENTOK-AUTH': jwt
      };
      const { data } = await axios.post(url, null, { headers });
      return data;
    } catch (err) {
      throw `stop Captions - ${ err.message || 'failed'}`;
    }
  },

  async sendSignal (sessionId, type, data) {
    return new Promise((resolve, reject) => {
      const payload = { type, data };
      payload.data = payload.data || '';
      if (typeof payload.data === 'object') payload.data = JSON.stringify(payload.data);
      opentok.signal(sessionId, null, payload, function (err) {
        if (err) {
          console.log(`send Signal ${ err.message || 'failed'}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },

});