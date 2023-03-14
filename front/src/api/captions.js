export const startCaptions = async (sessionId) => {

  const fetchURL = new URL(
    `/api/captions/start/${sessionId}`,
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_URL || ''
      : 'http://localhost:3002',
  );

  const response = await fetch(fetchURL.href);
  const json = await response.json();
  
  return json;
};

export const stopCaptions = async (sessionId) => {
  const fetchURL = new URL(
    `/api/captions/stop/${sessionId}`,
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_URL || ''
      : 'http://localhost:3002',
  );

  const response = await fetch(fetchURL.href);
  const json = await response.json();
  
  return json;
};
