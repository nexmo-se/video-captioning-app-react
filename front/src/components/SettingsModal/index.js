import React, { useState } from 'react';

import OT from '@opentok/client';
import useStyles from './styles';
import useDevices from '../../hooks/useDevices';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  InputLabel
} from '@mui/material';

import { getSourceDeviceId } from '../../utils';

export function SettingsModal({ open, onCloseClick, currentPublisher }) {
  const [audioDevice, setAudioDevice] = useState('');
  const [videoDevice, setVideoDevice] = useState('');
  const [audioOutputDevice, setAudioOutputDevice] = useState('');

  const { deviceInfo, getDevices } = useDevices();

  const classes = useStyles();

  const handleVideoSource = React.useCallback(
    async (e) => {
      const videoDeviceId = e.target.value;
      await currentPublisher.setVideoSource(videoDeviceId);
      setVideoDevice(videoDeviceId);
    },
    [
      currentPublisher, 
      setVideoDevice, 
    ]
  );

  const handleAudioSource = React.useCallback(
    async (e) => {
      const audioDeviceId = e.target.value;
      await currentPublisher.setAudioSource(audioDeviceId);
      setAudioDevice(audioDeviceId);
    },
    [
      currentPublisher, 
      setAudioDevice, 
    ]
  );

  const handleAudioOutput = React.useCallback(
    async (e) => {
      const audioOutputId = e.target.value;
      await OT.setAudioOutputDevice(audioOutputId);
      setAudioOutputDevice(audioOutputId);
    },
    [ 
      setAudioOutputDevice,
    ]
  );

  React.useEffect(() => {
    if (currentPublisher && deviceInfo) {
      const currentAudioDevice = currentPublisher.getAudioSource();
      setAudioDevice(
        getSourceDeviceId(deviceInfo.audioInputDevices, currentAudioDevice)
      );

      const currentVideoDevice = currentPublisher.getVideoSource();
      setVideoDevice(
        getSourceDeviceId(deviceInfo.videoInputDevices, currentVideoDevice?.track)
      );

      OT.getActiveAudioOutputDevice().then((currentAudioOutputDevice) => {
        setAudioOutputDevice(currentAudioOutputDevice.deviceId);
      });
    }
  }, [
    deviceInfo,
    currentPublisher,
    setAudioDevice,
    setVideoDevice,
    setAudioOutputDevice
  ]);

  React.useEffect(() => {
    getDevices().then(() => {
      console.log('[SettingsModal] - useEffect - getDevices');
    }).catch(console.log);
  }, []);

  return (
    <Dialog open={open} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent className={classes.flex}>
        <DialogContentText>
          You can change your microphone and camera input here.
        </DialogContentText>
        <FormControl sx={{mt:2}}>
          <InputLabel id="demo-simple-select-label">
            Select Audio Source
          </InputLabel>
          {deviceInfo.audioInputDevices && (
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={audioDevice}
            onChange={handleAudioSource}
            className={classes.selectWidth}
          >
            {deviceInfo.audioInputDevices.map((device) => (
              <MenuItem key={`audioInputDevices-${device.deviceId}`} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
          )}
        </FormControl>
        <FormControl sx={{mt:2}}>
          <InputLabel id="video">Select Audio Output</InputLabel>
          {deviceInfo.audioOutputDevices && (
            <Select
              labelId="video"
              id="demo-simple-select"
              value={audioOutputDevice}
              onChange={handleAudioOutput}
              autoWidth={true}
            >
              {deviceInfo.audioOutputDevices.map((device) => (
                <MenuItem key={`audioOutputDevices-${device.deviceId}`} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
        <FormControl sx={{mt:2}}>
          <InputLabel id="video">Select Video Source</InputLabel>
          {deviceInfo.videoInputDevices && (
            <Select
              labelId="video"
              id="demo-simple-select"
              value={videoDevice}
              onChange={handleVideoSource}
            >
              {deviceInfo.videoInputDevices.map((device) => (
                <MenuItem  key={`videoInputDevices-${device.deviceId}`} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onCloseClick}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
