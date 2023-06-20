import { useState, useRef, useCallback, useEffect } from 'react';
import OT from '@opentok/client';

import { useSubscriber } from './useSubscriber';

export function useSession({ container }) {
  const [connected, setConnected] = useState(false);
  const [streams, setStreams] = useState([]);

  const [isCaptioning, setIsCaptioning] = useState(false);

  const sessionRef = useRef(null);

  const {
    subscribers,
    subscribe,
    removeSubscriber,
  } = useSubscriber();

  const addStream = (stream) => {
    setStreams((prev) => [...prev, stream]);
  };

  const removeStream = (stream) => {
    setStreams((prev) =>
      prev.filter((prevStream) => prevStream.id !== stream.id)
    );
    removeSubscriber(stream.id);
  };

  const onSignalCaptionsStarted = useCallback((event) => {
    setIsCaptioning(true);
  }, []);

  const onSignalCaptionsStopped = useCallback((event) => {
    setIsCaptioning(false);
  }, []);

  const onStreamCreated = ({ stream }) => {
    subscribe(
      stream,
      sessionRef.current,
      container.current.id,
      isCaptioning,
    );
    addStream(stream);
  };

  const onStreamDestroyed = ({ stream }) => {
    removeStream(stream);
  };

  const onSessionConnected = (event) => {
    setConnected(true);
  };

  const onSessionDisconnected = (event) => {
    sessionRef.current = null;
    setConnected(false);
    setStreams([]);
  };

  const createSession = useCallback(async ({ apikey, sessionId, token }) => {
    if (sessionRef.current) {
      // console.log('[UseSession] - createSession already connected');
      return;
    }
    if (!apikey) {
      throw new Error('[UseSession] - createSession Missing apikey');
    }
    if (!sessionId) {
      throw new Error('[UseSession] - createSession Missing sessionId');
    }
    if (!token) {
      throw new Error('[UseSession] - createSession Missing token');
    }

    sessionRef.current = OT.initSession(apikey, sessionId);

    sessionRef.current.on({
    streamCreated: onStreamCreated,
    streamDestroyed: onStreamDestroyed,
    sessionConnected: onSessionConnected,
    sessionDisconnected: onSessionDisconnected,
    'signal:captions:started': onSignalCaptionsStarted,
    'signal:captions:stopped': onSignalCaptionsStopped,
  });

    return new Promise((resolve, reject) => {
      sessionRef.current.connect(token, (err) => {
        if (err) {
          console.log('[UseSession] - createSession err', err);
          sessionRef.current = null;
          reject(err);
        } else if (!err) {
          // console.log('[UseSession] - createSession done');
          setConnected(true);
          resolve(sessionRef.current);
        }
      });
    });
  }, [
    onStreamCreated,
    onStreamDestroyed, 
    onSessionConnected,
    onSessionDisconnected,
    onSignalCaptionsStarted,
    onSignalCaptionsStopped,
  ]);

  const disconnectSession = () => {
    if (sessionRef.current && connected) {
      sessionRef.current.disconnect();
      setConnected(false);
    }
    sessionRef.current = null;
  };

  return {
    session: sessionRef.current,
    connected,
    createSession,
    disconnectSession,
    isCaptioning, 
    setIsCaptioning,
    subscribers,
  };
}
