export const updateCaptions = async (sessionId, action) => {
  const fetchURL = new URL(
    `/api/captions/${action}/${sessionId}`,
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_URL
      : 'http://localhost:3002',
  );
  const response = await fetch(fetchURL.href);
  const json = await response.json();
  return json;
};
