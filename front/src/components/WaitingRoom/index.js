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
  TextField,
  List,
  ListItem,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';

const defaultLocalAudio = true;
const defaultLocalVideo = true;
const publisherOptions = {
  publishAudio: defaultLocalAudio,
  publishVideo: defaultLocalVideo,
};

const rooms = ['Room A', 'Room B', 'Room C'];
export function WaitingRoom() {
  let query = useQuery();
  const classes = useStyles();
  
  const { user, setUser } = useContext(UserContext);

  // const username = query.get('username')
  //   ? query.get('username')
  //   : user.username;

  const navigate = useNavigate();

  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);

  const [localVideoSource, setLocalVideoSource] = useState(undefined);
  const [localAudioSource, setLocalAudioSource] = useState(undefined);
  const [localAudioOutput, setLocalAudioOutput] = useState(undefined);

  const [audioDevice, setAudioDevice] = useState('');
  const [videoDevice, setVideoDevice] = useState('');
  const [audioOutputDevice, setAudioOutputDevice] = useState('');

  const [roomId, setRoomId] = useState('room-0');

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
    if (!user.username) {
      setUser({...user, username: `U${ Date.now() }`});
    }
    //navigate('/video-room');
    navigate({
      pathname: '/video-room',
      search: `?room=${roomId}`,
    });
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
      <AudioSettings
        hasAudio={localAudio}
        onAudioChange={handleAudioChange}
      />
      <VideoSettings
        hasVideo={localVideo}
        onVideoChange={handleVideoChange}
      />

      <div
        id="waiting-room-video-container"
        className={classes.waitingRoomVideoPreview}
        ref={waitingRoomVideoContainerRef}
      ></div>

      <List
        disablePadding
        sx={{ 
          width: '100%', 
          maxWidth: 360
        }}>
      
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
        <InputLabel id="audio-input">
          Select Audio Source
        </InputLabel>
        {deviceInfo.audioInputDevices && (
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
      <ListItem disablePadding>
      <FormControl margin="dense">
        <InputLabel id="room-list">Select Room</InputLabel>
        {rooms && (
          <Select
            labelId="room-list"
            id="room-list-select"
            value={roomId}
            onChange={(event) => {
              setRoomId(event.target.value);
            }}
            sx={{ width: 360 }}
          >
            {rooms.map((room, index) => (
              <MenuItem key={index} value={`room-${index}`}>
                {room}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
      </ListItem>
      <ListItem disablePadding>
      <FormControl margin="dense">
        <TextField
          id="username"
          label="*Your Name"
          value={user.username}
          onChange={(event) => {
            setUser({...user, username: event.target.value});
          }}
          sx={{ 
            width: 360,
          }}
        />
        </FormControl>
        </ListItem>
      </List>

      <Button
        variant="contained"
        onClick={handleJoinClick}
      >
      Join Call
      </Button>
    </Grid>
  );
}
