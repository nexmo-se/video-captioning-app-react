import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStyles from './styles';
import { UserContext } from '../../context/UserContext';
import { useQuery } from './../../hooks/useQuery';
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

  const query = useQuery();
  const _roomId = query.get('room')
    ? query.get('room')
    : 'room-0';

  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);

  const [roomId, setRoomId] = useState(_roomId);

  const waitingRoomVideoContainerRef = useRef();

  const {
    publisher,
    initPublisher,
    pubInitialised,
  } = usePublisher();

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
    setUser({
      ...user,
      defaultSettings: {
        publishAudio: localAudio,
        publishVideo: localVideo,
      }
    });
    localStorage.setItem('username', user.username);
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

      <FormControl margin="dense" fullWidth>
        <InputLabel id="room-list-select-label">*Select Room</InputLabel>
        {rooms && (
          <Select
            labelId="room-list-select-label"
            id="room-list-select"
            value={roomId}
            onChange={(event) => {
              setRoomId(event.target.value);
            }}
            label="*Select Room"
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

      <FormControl margin="dense" fullWidth>
        <TextField
          id="username"
          label="*Your Name"
          value={user.username}
          onChange={(event) => {
            setUser({...user, username: event.target.value});
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
