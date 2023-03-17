export const getCredentials = async (room = 'room-1') => {
  if (process.env.REACT_APP_VIDEO_SESSION && process.env.REACT_APP_VIDEO_TOKEN) {
    return Promise.resolve({
      apikey: process.env.REACT_APP_VIDEO_API_KEY,
      sessionId: process.env.REACT_APP_VIDEO_SESSION,
      token: process.env.REACT_APP_VIDEO_TOKEN,
    });
  }
  const fetchURL = new URL(
    `/api/room/${room}/token`,
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_URL || ''
      : 'http://localhost:3002',
  );
  const response = await fetch(fetchURL.href);
  const json = await response.json();
  
  return json;
};
