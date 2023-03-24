export const getCredentials = async (room = 'room-0') => {
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
