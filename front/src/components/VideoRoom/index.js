import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import {
  Button,
  Stack,
} from '@mui/material';

import useStyles from './styles';
import { getCredentials } from '../../api/credentials';
import { startCaptions, stopCaptions } from '../../api/captions';

import { UserContext } from '../../context/UserContext';
import { CaptionsContext } from '../../context/CaptionsContext';

import { usePublisher } from '../../hooks/usePublisher';
import { useSession } from '../../hooks/useSession';
import { useSubscriber } from '../../hooks/useSubscriber';

import { ControlToolBar } from '../ControlToolBar';
import { CaptionBar } from '../CaptionBar';

import { CaptionBox } from '../CaptionBox';

export function VideoRoom() {
  const classes = useStyles();

  const { user } = useContext(UserContext);
  const { captions, toggleSubscribeToCaptions, onCaptionReceived } = useContext(CaptionsContext);

  const [credentials, setCredentials] = useState(null);

  const [hasAudio, setHasAudio] = useState(user.defaultSettings.publishAudio);
  const [hasVideo, setHasVideo] = useState(user.defaultSettings.publishVideo);

  const [subToCaptions, setSubToCaptions] = useState(false);

  const videoContainerRef = useRef();

  const { 
    publisher, 
    publish, 
    pubInitialised,
    stream,
    subscriber,
    subscribeSelf,
  } = usePublisher({
    container: videoContainerRef
  });
  
  const { 
    session,
    createSession, 
    connected,
    streams,
    isCaptioning, 
    setIsCaptioning,
   } = useSession();

  const {
    subscribers,
    subscribe,
  } = useSubscriber({
    container: videoContainerRef,
  });

  const toggleAudio = useCallback(() => {
    setHasAudio((prevAudio) => !prevAudio);
  }, []);
  const toggleVideo = useCallback(() => {
    setHasVideo((prevVideo) => !prevVideo);
  }, []);
  const toggleIsCaptioning = useCallback(() => {
    setIsCaptioning((prev) => !prev);
  }, []);
  const toggleSubToCaptions = useCallback(() => {
    setSubToCaptions((prev) => !prev);
  }, []);

  useEffect(() => {
    getCredentials().then(({ apikey, sessionId, token }) => {
      setCredentials({ apikey, sessionId, token });
    });
  }, []);
  
  useEffect(() => {
    if (credentials) {
      let { sessionId } = credentials;
      if (isCaptioning && sessionId) {
        startCaptions(sessionId).then((data) => {
          console.log('startCaptions', data);
          if (!data.captionsId) setIsCaptioning(false);
        }).catch(console.log);
      } else if (!isCaptioning && sessionId) {
        stopCaptions(sessionId).then((data) => {
          console.log('stopCaptions', data);
        }).catch(console.log);
      }
    }
  }, [isCaptioning, credentials]);

  useEffect(() => {
    if (credentials) {
      createSession(credentials);
    }
  }, [createSession, credentials]);

  useEffect(() => {
    if (session && connected && !pubInitialised) {
      const publisherOptions = {
        publishAudio: hasAudio,
        publishVideo: hasVideo,
        name: user.username, 
      };
      publish({
        session: session,
        publisherOptions
      });
    }
  }, [publish, session, connected, pubInitialised]);

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
    if (session && connected && pubInitialised && stream && !subscriber) {
      subscribeSelf({
        session,
        stream,
      });
    }
  }, [subscribeSelf, session, connected, pubInitialised, stream, subscriber]);

  useEffect(() => {
    if (session && streams) {
      const res = subscribe({
        session,
        streams,
      });
      res.then(() => {
      }).catch(console.log);
    }
  }, [subscribe, session, streams]);

  useEffect(() => {
    if (subscriber) {
      publisher.publishAudio(hasAudio);
      subscriber.off('captionReceived');
      if (isCaptioning && subToCaptions) {
        subscriber.on('captionReceived', (event) => onCaptionReceived(event, subscriber));
      }
      if (isCaptioning) toggleSubscribeToCaptions(subToCaptions, subscriber);
    }
  }, [subscriber, isCaptioning, subToCaptions, onCaptionReceived, toggleSubscribeToCaptions]);

  useEffect(() => {
    if (subscribers) {
      for (const subscriber of subscribers) {
        subscriber.off('captionReceived');
        if ((isCaptioning && subToCaptions)) {
          subscriber.on('captionReceived', (event) => onCaptionReceived(event, subscriber));
        }
        if (isCaptioning) toggleSubscribeToCaptions(subToCaptions, subscriber);
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
    <CaptionBox captions={captions} />
    <Button 
        sx={{
          border: '1px solid',
          p: 1,
          borderRadius: 2,
          position: 'absolute',
          bottom: 10,
          right: 180,
          zIndex: 'tooltip',
        }}
        onClick={toggleIsCaptioning} >{isCaptioning? 'Disable' : 'Enable'} Caption for Session</Button>

    <ControlToolBar
      className={classes.controlToolbar}
      hasAudio={hasAudio}
      hasVideo={hasVideo}
      handleMicButtonClick={toggleAudio}
      handleVideoButtonClick={toggleVideo}
      currentPublisher={publisher}
      isCaptioning={isCaptioning && subToCaptions}
      handleCaptionMicClick={toggleSubToCaptions}
    />
  </Stack>);
}
