import { useCallback, useRef, useState, useEffect } from 'react';
import OT from '@opentok/client';

const defaultPublisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  publishCaptions: true,
  showControls: false,
  fitMode: 'contain',
};

export function usePublisher() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [pubInitialised, setPubInitialised] = useState(false);
  const [stream, setStream] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [videoElement, setVideoElement] = useState(null);

  const publisherRef = useRef();

  const streamCreatedListener = useCallback(({ stream }) => {
    setIsPublishing(true);
    setStream(stream);
  }, []);

  const streamDestroyedListener = useCallback(() => {
    setIsPublishing(false);
    setStream(null);
    setSubscriber(null);
  }, []);

  const videoElementCreatedListener = useCallback(({ element }) => {
    setPubInitialised(true);
    setVideoElement(element);
  }, []);

  const destroyedListener = useCallback(() => {
    console.log('[UsePublisher] publisher destroyed');
    publisherRef.current = null;
    setPubInitialised(false);
    setIsPublishing(false);
    setStream(null);
    setSubscriber(null);
  }, []);

  const accessAllowedListener = useCallback(async () => {
  }, []);

  const accessDeniedListener = useCallback(() => {
    publisherRef.current = null;
    setPubInitialised(false);
  }, []);

  const initPublisher = useCallback(
    ({ container, publisherOptions }) => {
      if (publisherRef.current) {
        // console.log('[UsePublisher] - initPublisher - already initiated');
        return;
      }

      const finalPublisherOptions = Object.assign({}, defaultPublisherOptions, publisherOptions);
      // console.log('[UsePublisher] - finalPublisherOptions', finalPublisherOptions);
      
      publisherRef.current = OT.initPublisher(
        container.current.id,
        finalPublisherOptions,
        (err) => {
          if (err) {
            console.log('[UsePublisher] - initPublisher err', err);
            publisherRef.current = null;
          } else {
            // console.log('[UsePublisher] - initPublisher done');
          }
        }
      );

      publisherRef.current.on('accessAllowed', accessAllowedListener);
      publisherRef.current.on('accessDenied', accessDeniedListener);
      publisherRef.current.on('streamCreated', streamCreatedListener);
      publisherRef.current.on('streamDestroyed', streamDestroyedListener);
      publisherRef.current.on('videoElementCreated', videoElementCreatedListener);
      publisherRef.current.on('destroyed', destroyedListener);

      setPubInitialised(true);
    },
    [
      accessAllowedListener,
      accessDeniedListener,
      streamCreatedListener,
      streamDestroyedListener,
    ]);

  const destroyPublisher = () => {
    if (publisherRef.current && pubInitialised) {
      publisherRef.current.destroy();
    }
  };

  const publish = useCallback(
    ({ container, session, publisherOptions }) => {

      if (!publisherRef.current) {
        initPublisher({ container, publisherOptions });
      }

      if (session && publisherRef.current && !isPublishing) {
        return new Promise((resolve, reject) => {
          session.publish(publisherRef.current, (err) => {
            if (err) {
              console.log('[UsePublisher] - session.publish err', err);
              return reject(err);
            } else {
              // console.log('[UsePublisher] - session.publish done');
              setIsPublishing(true);
              resolve(publisherRef.current);
            }
          });
        });
      }
    },
    [
      initPublisher,
    ]
  );

  const unpublish = ({ session }) => {
    if (subscriber) {
      session.unsubscribe(subscriber);
      setSubscriber(null);
    }
    if (publisherRef.current && isPublishing) {
      session.unpublish(publisherRef.current);
      setIsPublishing(false);
    }
    publisherRef.current = null;
  };

  const subscribeSelf = 
    ({session, stream}) => {
      if (!session) {
        return;
      }
      return new Promise((resolve, reject) => {
        const subscriber = session.subscribe(
          stream,
          videoElement,
          {
            insertMode: 'replace',
            width: '100%',
            height: '100%',
            style: {
              buttonDisplayMode: 'on',
              nameDisplayMode: 'on',
            },
            showControls: true,
            fitMode: 'contain',
            testNetwork: true,
            subscribeToAudio: false,
            subscribeToVideo: false,
          }, 
          (err) => {
            if (err) {
              console.log('[usePublisher] - session.subscribe err', err);
              setSubscriber(null);
              return reject(null);
            } else {
              // console.log('[usePublisher] - session.subscribe done');
              subscriber.streamName = `${subscriber.stream.name}`;
              setSubscriber(subscriber);
              resolve(subscriber);
            }
          }
        );
      });
    };

  return {
    publisher: publisherRef.current,
    initPublisher,
    publish,
    pubInitialised,
    isPublishing,
    unpublish,
    destroyPublisher,
    stream,
    subscriber,
    subscribeSelf,
  };
}
