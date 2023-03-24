import { useState, useEffect, useCallback } from 'react';
import OT from '@opentok/client';

export default function useDevices() {
  const [deviceInfo, setDeviceInfo] = useState({
    audioInputDevices: [],
    videoInputDevices: [],
    audioOutputDevices: [],
  });

  const getDevices = useCallback(async (event) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.warn('enumerateDevices() not supported.');
      return;
    }
    return await new Promise((resolve, reject) => {
      OT.getDevices(async (err, devices) => {
        // OT.getDevices 
        // - Enumerates the audio input devices (such as microphones) 
        // - and video input devices (cameras) available to the browser.
        if (err) {
          reject(err);
        }

        let audioOutputDevices = await OT.getAudioOutputDevices();
        // OT.getAudioOutputDevices 
        // - Enumerates the audio output devices (such as speakers) available to the browser.

        const audioInputDevices = devices.filter(
          (d) => d.kind.toLowerCase() === 'audioinput'
        );
        
        const videoInputDevices = devices.filter(
          (d) => d.kind.toLowerCase() === 'videoinput'
        );

        setDeviceInfo({
          audioInputDevices,
          videoInputDevices,
          audioOutputDevices,
        });
      });
    });
  }, []);

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', getDevices);

    getDevices().then().catch(console.error);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [getDevices]);

  return { deviceInfo, getDevices };
}
