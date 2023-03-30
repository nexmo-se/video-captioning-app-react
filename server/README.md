# video-captioning-app-server-express

check `./services/index.js` for sample code for for Live Captions — REST API: `startCaptions` and `stopCaptions`

## Prerequisites
- Vonage API account 

## Install

npm install

## Environment variables
- `OT_API_KEY`, `OT_API_SECRET`:
    Vonage Video Project API KEY and API SECRET.
- `APP_URL`:
    Public URL to the APP server, Live Caption status updates are sent to ${APP_URL}/monitor/session
- `CAPTION_MAX_DURATION` (Optional) :
	The maximum allowed duration for the audio captioning. 
	The default value set by the demo app is 30 minutes, 
	The maximum allowed duration by Video API is 4 hours.

## Available Scripts

In the project directory, you can run:

### `npm start`

Open [http://localhost:3002](http://localhost:3002) to view it in your browser.

