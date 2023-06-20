import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Stack,
} from '@mui/material';
import useStyles from './styles';

import { getCredentials } from '../../api/credentials';
import { updateCaptions } from '../../api/captions';
import { UserContext } from '../../context/UserContext';
import { CaptionsContext } from '../../context/CaptionsContext';
import { useQuery } from './../../hooks/useQuery';
import { usePublisher } from '../../hooks/usePublisher';
import { useSession } from '../../hooks/useSession';
import { ControlToolBar } from '../ControlToolBar';
import { CaptionBar } from '../CaptionBar';
import { CaptionBox } from '../CaptionBox';

export function VideoRoom() {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const query = useQuery();
  const _roomId = query.get('room')
    ? query.get('room')
    : 'room-0';

  const { captions, toggleSubscribeToCaptions, onCaptionReceived } = useContext(CaptionsContext);

  const [credentials, setCredentials] = useState(null);
  const [hasAudio, setHasAudio] = useState(user.defaultSettings.publishAudio);
  const [hasVideo, setHasVideo] = useState(user.defaultSettings.publishVideo);

  const [subToCaptions, setSubToCaptions] = useState(true);

  const videoContainerRef = useRef();

  const { 
    publisher, 
    publish, 
    isPublishing,
    stream,
    subscriber,
    subscribeSelf,
  } = usePublisher();
  
  const { 
    session,
    createSession, 
    connected,
    isCaptioning, 
    setIsCaptioning,
    subscribers,
   } = useSession({
    container: videoContainerRef
  });

  const toggleAudio = useCallback(() => {
    setHasAudio((prevAudio) => !prevAudio);
  }, []);

  const toggleVideo = useCallback(() => {
    setHasVideo((prevVideo) => !prevVideo);
  }, []);

  const toggleIsCaptioning = useCallback(() => {
    const { sessionId } = credentials;
    const action = isCaptioning === false? 'start' : 'stop';
    // console.log(updateCaptions, action);
    if (sessionId) updateCaptions(sessionId, action).then(data => console.log(data)).catch(console.log);
    setIsCaptioning((prev) => !prev);
  }, [credentials, isCaptioning]);
  const toggleSubToCaptions = useCallback(() => {
    setSubToCaptions((prev) => !prev);
  }, []);

  useEffect(() => {
    let _username = localStorage.getItem('username');
    if (!_username) {
      navigate({
        pathname: '/waiting-room',
        search: `?room=${_roomId}`,
      });
    }
    getCredentials(_roomId).then(({ apikey, sessionId, token, captionsId }) => {
      setCredentials({ apikey, sessionId, token });
      if (captionsId) setIsCaptioning(true);
    });
  }, []);

  useEffect(() => {
    if (credentials) {
      createSession(credentials);
    }
  }, [createSession, credentials]);

  useEffect(() => {
    if (session && connected && !isPublishing) {
      let publisherOptions = {
        publishAudio: hasAudio,
        publishVideo: hasVideo,
        name: user.username, 
      };
      publish({
        container: videoContainerRef,
        session: session,
        publisherOptions
      });
    }
  }, [publish, session, connected, isPublishing]);

  useEffect(() => {
    if (publisher) {
      publisher.publishAudio(hasAudio);
    }
  }, [hasAudio, publisher]);

  useEffect(() => {
    if (publisher) {
      publisher.publishVideo(hasVideo);
    }
  }, [hasVideo, publisher]);

  useEffect(() => {
    if (session && connected && isPublishing && stream && !subscriber) {
      subscribeSelf({
        session,
        stream,
      });
    }
  }, [subscribeSelf, session, connected, isPublishing, stream, subscriber]);

  useEffect(() => {
    if (subscriber) {
      // local client [self-subscribe]
      publisher.publishAudio(hasAudio);
      subscriber.off('captionReceived');
      if (isCaptioning && subToCaptions) {
        subscriber.on('captionReceived', (event) => onCaptionReceived(event, subscriber));
      }
      if (isCaptioning) toggleSubscribeToCaptions((isCaptioning && subToCaptions), subscriber);
    }
  }, [subscriber, isCaptioning, subToCaptions, onCaptionReceived, toggleSubscribeToCaptions]);

  useEffect(() => {
    if (subscribers) {
      // remote clients 
      for (const subscriber of subscribers) {
        subscriber.off('captionReceived');
        if (isCaptioning && subToCaptions) {
          subscriber.on('captionReceived', (event) => onCaptionReceived(event, subscriber));
        }
        if (isCaptioning) toggleSubscribeToCaptions((isCaptioning && subToCaptions), subscriber);
      }
    }
  }, [subscribers, isCaptioning, subToCaptions, onCaptionReceived, toggleSubscribeToCaptions]);

  return (
  <Stack
    direction="column"
    justifyContent="center"
    alignItems="center"
    spacing={1}
  >
    <div
      id="video-container"
      className={ classes.videoContainer }
      ref={ videoContainerRef }
    >
    </div>
    <CaptionBar captions={captions} className={classes.captionsBar} />
    <ControlToolBar
      className={classes.controlToolbar}
      hasAudio={hasAudio}
      hasVideo={hasVideo}
      handleMicButtonClick={toggleAudio}
      handleVideoButtonClick={toggleVideo}
      // currentPublisher={publisher}
      isCaptioning={isCaptioning}
      subToCaptions={!!isCaptioning && !!subToCaptions}
      handleCaptionMicClick={toggleSubToCaptions}
    />
    <Button 
      className={classes.captionsButton}
      sx={{
        p: 1,
        border: '1px solid',
        borderRadius: 2,
        position: 'absolute',
        top: '3%',
        left: '1%',
        pt: 0,
        pb: 0,
        zIndex: 'tooltip',
      }}
      onClick={toggleIsCaptioning} >{isCaptioning? 'disable' : 'enable'} CC for Session</Button>
      <CaptionBox captions={captions} />
  </Stack>);
}
