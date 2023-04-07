import { useState, useRef, useCallback, useEffect } from 'react';
import OT from '@opentok/client';

export function useSession() {
  const [connected, setConnected] = useState(false);
  const [streams, setStreams] = useState([]);

  const [isCaptioning, setIsCaptioning] = useState(false);

  const sessionRef = useRef(null);

  const onSignalCaptionsStarted = useCallback((event) => {
    setIsCaptioning(true);
  }, []);

  const onSignalCaptionsStopped = useCallback((event) => {
    setIsCaptioning(false);
  }, []);

  const onStreamCreated = useCallback(({ stream }) => {
    if (!streams.find(el => el.id === stream.id)) {
      setStreams((prev) => [...prev, stream]);
    }
  }, []);

  const onStreamDestroyed = useCallback((event) => {
    setStreams((prev) =>
      prev.filter((prev) => prev.id !== event.stream.id)
    );
  }, []);

  const onSessionDisconnected = useCallback((event) => {
    if (sessionRef.current) sessionRef.current = null;
  }, []);

  const eventHandlers = {
    streamCreated: onStreamCreated,
    streamDestroyed: onStreamDestroyed,
    sessionDisconnected: onSessionDisconnected,
    'signal:captions:started': onSignalCaptionsStarted,
    'signal:captions:stopped': onSignalCaptionsStopped,
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

    sessionRef.current.off(eventHandlers);
    sessionRef.current.on(eventHandlers);

    return new Promise((resolve, reject) => {
      sessionRef.current.connect(token, (err) => {
        if (!sessionRef.current) {
          // console.log('[UseSession] - createSession already exists');
          return;
        }
        if (err) {
          console.log('[UseSession] - createSession err', err);
          reject(err);
        } else if (!err) {
          // console.log('[UseSession] - createSession done');
          setConnected(true);
          resolve(sessionRef.current);
        }
      });
    });

  }, [
    onStreamDestroyed, 
    onSessionDisconnected, 
    onStreamCreated,
    connected,
  ]);

  const destroySession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.on('disconnected', () => {
        sessionRef.current = null;
      });
      sessionRef.current.disconnect();
      sessionRef.current = null;
    }
  }, []);

  return {
    session: sessionRef.current,
    connected,
    createSession,
    destroySession,
    streams,
    isCaptioning, 
    setIsCaptioning,
  };
}
