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
    console.log('[UseSession] - onSessionConnected');
  };

  const onSessionDisconnected = (event) => {
    sessionRef.current = null;
  };

  const createSession = useCallback(({ apikey, sessionId, token }) => {
    if (connected) {
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
        if (!sessionRef.current) {
          // console.log('[UseSession] - createSession already exists');
          return;
        }
        if (err) {
          console.log('[UseSession] - createSession err', err);
          setConnected(false);
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

  const destroySession = useCallback(() => {
    if (sessionRef.current && connected) {
      sessionRef.current.disconnect();
    }
    sessionRef.current = null;
  }, []);

  return {
    session: sessionRef.current,
    connected,
    createSession,
    destroySession,
    isCaptioning, 
    setIsCaptioning,
    subscribers,
  };
}
