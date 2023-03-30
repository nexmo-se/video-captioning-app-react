import { useContext, useEffect, useRef, useState, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import useStyles from './styles';

import { UserContext } from '../../context/UserContext';
import { usePublisher } from '../../hooks/usePublisher';
import { AudioSettings } from '../AudioSetting';
import { VideoSettings } from '../VideoSetting';

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
  const classes = useStyles();
  
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();

  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);

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
    return () => {
      destroyPublisher();
    };
  }, [destroyPublisher]);

  useEffect(() => {
    let _user = {
      ...user,
      defaultSettings: {
        publishAudio: localAudio,
        publishVideo: localVideo,
      }
    }

    setUser({..._user});
  }, [
    user,
    setUser,
    localAudio,
    localVideo,
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
        sx={{ width: '100%', maxWidth: 360}}>

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
          sx={{ width: 360 }}
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
