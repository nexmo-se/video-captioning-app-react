/**
 * For both audio and video
 * 
 * @param {*} inputDevices 
 * @param {*} currentSource 
 * @returns String toReturn
 */

const getSourceDeviceId = (inputDevices, currentSource) => {
  let toReturn = '';
  // console.log('getSourceDeviceId', inputDevices, currentSource);
  if (!inputDevices || !currentSource) {
    return toReturn;
  }
  for (let i = 0; i < inputDevices.length; i += 1) {
    if (inputDevices[i].label === currentSource.label) {
      toReturn = inputDevices[i].deviceId;
      break;
    }
  }
  return toReturn;
};

export { getSourceDeviceId };
