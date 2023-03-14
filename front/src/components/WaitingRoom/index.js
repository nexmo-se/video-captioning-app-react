import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import OT from '@opentok/client';
import { useNavigate } from 'react-router-dom';
import useStyles from './styles';

import { UserContext } from '../../context/UserContext';
import { useQuery } from './../../hooks/useQuery';
import { usePublisher } from '../../hooks/usePublisher';
import { AudioSettings } from '../AudioSetting';
import { VideoSettings } from '../VideoSetting';

import { getSourceDeviceId } from '../../utils';
import {
  List,
  ListItem,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';

const defaultLocalAudio = true;
const defaultLocalVideo = true;
const publisherOptions = {
  publishAudio: defaultLocalAudio,
  publishVideo: defaultLocalVideo,
};

export function WaitingRoom() {
  let query = useQuery();
  const classes = useStyles();
  
  const { user, setUser } = useContext(UserContext);

  const username = query.get('username')
    ? query.get('username')
    : user.username;

  const navigate = useNavigate();

  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);

  const [localVideoSource, setLocalVideoSource] = useState(undefined);
  const [localAudioSource, setLocalAudioSource] = useState(undefined);
  const [localAudioOutput, setLocalAudioOutput] = useState(undefined);

  const [audioDevice, setAudioDevice] = useState('');
  const [videoDevice, setVideoDevice] = useState('');
  const [audioOutputDevice, setAudioOutputDevice] = useState('');

  const waitingRoomVideoContainerRef = useRef();

  const {
    publisher,
    initPublisher,
    destroyPublisher,
    deviceInfo,
    pubInitialised,
  } = usePublisher({
    container: waitingRoomVideoContainerRef
  });

  const handleAudioChange = useCallback((e) => {
    setLocalAudio(e.target.checked);
  }, []);

  const handleVideoChange = useCallback((e) => {
    setLocalVideo(e.target.checked);
  }, []);

  const handleVideoSource = useCallback(
    (e) => {
      const videoDeviceId = e.target.value;
      setVideoDevice(e.target.value);
      publisher.setVideoSource(videoDeviceId);
      setLocalVideoSource(videoDeviceId);
    },
    [publisher]
  );

  const handleAudioSource = useCallback(
    (e) => {
      const audioDeviceId = e.target.value;
      setAudioDevice(audioDeviceId);
      publisher.setAudioSource(audioDeviceId);
      setLocalAudioSource(audioDeviceId);
    },
    [publisher]
  );

  const handleAudioOutput = useCallback(
    (e) => {
      const audioOutputId = e.target.value;
      setAudioOutputDevice(audioOutputId);
      OT.setAudioOutputDevice(audioOutputId);
      setLocalAudioOutput(audioOutputId);
    },
    []
  );

  const handleJoinClick = () => {
    navigate('/video-room');
    // navigate({
    //   pathname: '/video-room',
    //   search: '?sort=date&order=newest',
    // });
  };

  useEffect(() => {
    if (waitingRoomVideoContainerRef.current && !pubInitialised) {
      initPublisher({
        container: waitingRoomVideoContainerRef,
        publisherOptions
      });
    }
  }, [initPublisher, pubInitialised]);

  useEffect(() => {
    if (publisher) {
      publisher.publishAudio(localAudio);
    }
  }, [localAudio, publisher]);

  useEffect(() => {
    if (publisher) {
      publisher.publishVideo(localVideo);
    }
  }, [localVideo, publisher]);

  useEffect(() => {
    if (publisher && pubInitialised && deviceInfo) {
      const currentAudioDevice = publisher.getAudioSource();
      setAudioDevice(
        getSourceDeviceId(
          deviceInfo.audioInputDevices, 
          currentAudioDevice
        )
      );

      const currentVideoDevice = publisher.getVideoSource();
      // setVideoDevice(currentVideoDevice.deviceId);
      setVideoDevice(
        getSourceDeviceId(
          deviceInfo.videoInputDevices,
          currentVideoDevice?.track
        )
      );

      OT.getActiveAudioOutputDevice().then((currentAudioOutputDevice) => {
        setAudioOutputDevice(currentAudioOutputDevice.deviceId);
      });
    }
    
  }, [
    deviceInfo,
    publisher,
    setAudioDevice,
    setVideoDevice,
    setAudioOutputDevice,
    pubInitialised,
  ]);

  useEffect(() => {
    return () => {
      destroyPublisher();
    };
  }, [destroyPublisher]);

  useEffect(() => {
    setUser({
      ...user,
      defaultSettings: {
        publishAudio: localAudio,
        publishVideo: localVideo,
        audioSource: localAudioSource,
        videoSource: localVideoSource,
        audioOutput: localAudioOutput,
      }
    });
  }, [
    user,
    setUser,
    localAudio,
    localVideo,
    localAudioSource,
    localVideoSource,
    localAudioOutput,
  ]);

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Typography textAlign="left" variant="caption" display="block" gutterBottom sx={{mt: 5}}>
       Hello, {username}
      </Typography>

      <List>
      <ListItem disablePadding>
      <FormControl margin="dense">
        <InputLabel id="audio-input">
          Select Audio Source
        </InputLabel>
        <Select
          labelId="audio-input"
          id="audio-intput-select"
          value={audioDevice}
          onChange={handleAudioSource}
          sx={{ 
            width: 360,
          }}
        >
          {deviceInfo.audioInputDevices.map((device, index) => (
            <MenuItem key={index} value={device.deviceId}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      </ListItem>
      
      <ListItem disablePadding>
      <FormControl margin="dense">
        <InputLabel id="audio-output">Select Audio Output</InputLabel>
        {deviceInfo.audioOutputDevices && (
          <Select
            labelId="audio-output"
            id="audio-output-select"
            value={audioOutputDevice}
            onChange={handleAudioOutput}
            sx={{ 
              width: 360,
            }}
          >
            {deviceInfo.audioOutputDevices.map((device, index) => (
              <MenuItem key={index} value={device.deviceId}>
                {device.label}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
      </ListItem>
      
      <ListItem disablePadding>
      <FormControl margin="dense">
        <InputLabel id="video">Select Video Source</InputLabel>
        {deviceInfo.videoInputDevices && (
          <Select
            labelId="video"
            id="video-select"
            value={videoDevice}
            onChange={handleVideoSource}
            sx={{ 
              width: 360,
            }}
          >
          {deviceInfo.videoInputDevices.map((device, index) => (
            <MenuItem key={index} value={device.deviceId}>
              {device.label}
            </MenuItem>
          ))}
          </Select>
        )}
      </FormControl>
      </ListItem>
      </List>

      <div
        id="waiting-room-video-container"
        className={classes.waitingRoomVideoPreview}
        ref={waitingRoomVideoContainerRef}
      ></div>

      <AudioSettings
        hasAudio={localAudio}
        onAudioChange={handleAudioChange}
      />
      <VideoSettings
        hasVideo={localVideo}
        onVideoChange={handleVideoChange}
      />
      <Button
        variant="contained"
        onClick={handleJoinClick}
      >
      Join Call
      </Button>

    </Grid>
  );
}
