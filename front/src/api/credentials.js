export const getCredentials = async (room = 'room-0') => {
  // set in .env.development
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve({
      apikey: process.env.REACT_APP_VIDEO_API_KEY,
      sessionId: process.env.REACT_APP_VIDEO_SESSION,
      token: process.env.REACT_APP_VIDEO_TOKEN,
    });
  }
    
  const fetchURL = new URL(
    `/api/room/${room}/token`,
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_URL
      : 'http://localhost:3002',
  );
  const response = await fetch(fetchURL.href);
  const json = await response.json();
  // console.log(json);
  return json;
};
