import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import {
  Stack,
} from '@mui/material';

import useStyles from './styles';
import { getCredentials } from '../../api/credentials';
import { startCaptions, stopCaptions } from '../../api/captions';
import { UserContext } from '../../context/UserContext';
import { usePublisher } from '../../hooks/usePublisher';
import { useSession } from '../../hooks/useSession';
import { useSubscriber } from '../../hooks/useSubscriber';

import { ControlToolBar } from '../ControlToolBar';
import { CaptionBar } from '../CaptionBar';

export function VideoRoom() {
  const classes = useStyles();
  const { user } = useContext(UserContext);

  const [publisherOptions, setPublisherOptions] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [hasAudio, setHasAudio] = useState(user.defaultSettings.publishAudio);
  const [hasVideo, setHasVideo] = useState(user.defaultSettings.publishVideo);
  const [isCaptioning, setIsCaptioning] = useState(true);

  const videoContainerRef = useRef();

  const { 
    publisher, 
    publish, 
    pubInitialised 
  } = usePublisher({
    container: videoContainerRef
  });
  
  const { 
    session,
    createSession, 
    connected,
    streams
   } = useSession();

  const {
    subscribe,
    captions,
    toggleSubscribeToCaptions,
  } = useSubscriber({
    container: videoContainerRef,
    session
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

  useEffect(() => {
    setPublisherOptions({ ...user.defaultSettings, name: user.username });
  }, [user]);

  useEffect(() => {
    getCredentials().then(({ apikey, sessionId, token }) => {
      setCredentials({ apikey, sessionId, token });
    });
  }, []);
  
  useEffect(() => {
    if (credentials) {
      createSession(credentials);
    }
  }, [createSession, credentials]);

  useEffect(() => {
    if (session && connected && !pubInitialised) {
      publish({
        session: session,
        publisherOptions
      });
    }
  }, [publish, session, connected, pubInitialised, publisherOptions]);

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
    if (session && streams) {
      subscribe({
        session,
        streams,
      });
    }
  }, [subscribe, session, streams]);

  useEffect(() => {
    if (session) {
      if (isCaptioning === true) {
        startCaptions(session.id).then((data) => {
          console.log('startCaptions', data);
        }).catch(console.log);
      } else {
        stopCaptions(session.id).then((data) => {
          console.log('stopCaptions', data);
        }).catch(console.log);
      }
      toggleSubscribeToCaptions(isCaptioning);
    }
  }, [session, isCaptioning, toggleSubscribeToCaptions, startCaptions, stopCaptions]);

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
      currentSession={session}
      currentPublisher={publisher}
      videoContainer={videoContainerRef}
      isCaptioning={isCaptioning}
      handleCaptionMicClick={toggleIsCaptioning}
    />
  </Stack>);
}
