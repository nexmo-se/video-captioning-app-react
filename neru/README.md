# video-captioning-app-server-express

check `./services/index.js` for sample code for for Live Captions — REST API: `startCaptions` and `stopCaptions`

## Prerequisites
- Vonage API account 
- Early Access for VCP/NeRu

## Install

- `npm install`
- `neru init`

## Environment variables
- `OT_API_KEY`, `OT_API_SECRET`:
    Vonage Video Project API KEY and API SECRET.


## Available Scripts

In the project directory, you can run:

### `npm start` / `neru debug` to start a Debugger
- Run `npm start` in the `../frontend` to start frontend app

### `neru deploy` to deploy it to your neru account
- Before runing `neru deploy`, copy the frontent build directory to `neru/public`: `cd ../front && run npm build && cp ./build ../neru/public`

