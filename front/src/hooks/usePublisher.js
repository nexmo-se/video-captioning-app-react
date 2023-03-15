import { useCallback, useRef, useState, 
  // useEffect 
} from 'react';
import useDevices from '../hooks/useDevices';
import OT from '@opentok/client';

const defaultPublisherOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  publishVideo: true,
  publishAudio: true,
  publishCaptions: true,
  style: {
    buttonDisplayMode: 'on',
    nameDisplayMode: 'on',
  },
  showControls: false,
  fitMode: 'contain',
};

export function usePublisher({ container }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [pubInitialised, setPubInitialised] = useState(false);

  const publisherRef = useRef();

  const { deviceInfo, getDevices } = useDevices();

  const streamCreatedListener = useCallback(({ stream }) => {
    setPubInitialised(true);
  }, []);

  const streamDestroyedListener = useCallback(({ stream }) => {
    publisherRef.current = null;
    setPubInitialised(false);
    setIsPublishing(false);
  }, []);

  // const videoElementCreatedListener = useCallback(() => {
  //   setPubInitialised(true);
  // }, []);

  const destroyedListener = useCallback(() => {
    publisherRef.current = null;
    setPubInitialised(false);
    setIsPublishing(false);
  }, []);

  const accessAllowedListener = useCallback(async () => {
    await getDevices().catch(console.log);
    //setPubInitialised(true);
  }, [getDevices]);

  const accessDeniedListener = useCallback(() => {
    publisherRef.current = null;
    setPubInitialised(false);
  }, []);

  const initPublisher = useCallback(({container, publisherOptions}) => {
    console.log('[UsePublisher] - initPublisher called');

    if (publisherRef.current) {
      console.log('[UsePublisher] - initPublisher - already initiated', pubInitialised);
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
          console.log('[UsePublisher] - initPublisher done');
        }
      }
    );

    publisherRef.current.on('accessAllowed', accessAllowedListener);
    publisherRef.current.on('accessDenied', accessDeniedListener);
    publisherRef.current.on('streamCreated', streamCreatedListener);
    publisherRef.current.on('streamDestroyed', streamDestroyedListener);
    // publisherRef.current.on('videoElementCreated', videoElementCreatedListener);
    publisherRef.current.on('destroyed', destroyedListener);

    setPubInitialised(true);

  }, 
  [
    destroyedListener,
    streamCreatedListener,
    streamDestroyedListener,
    accessAllowedListener,
    accessDeniedListener,
  ]);

  const destroyPublisher = useCallback(() => {
    if (publisherRef.current) {
      publisherRef.current.destroy();
    }
  }, []);

  const publish = useCallback(
    ({ session, publisherOptions }) => {

      if (!publisherRef.current) {
        initPublisher({container, publisherOptions});
      }

      if (session && publisherRef.current && !isPublishing) {
        return new Promise((resolve, reject) => {
          session.publish(publisherRef.current, (err) => {
            if (err) {
              console.log('[UsePublisher] - session.publish err', err);
              setIsPublishing(false);
              publisherRef.current = null;
              reject(err);
            }
            console.log('[UsePublisher] - session.publish done');
            setIsPublishing(true);
            resolve(publisherRef.current);
          });
        });

        // isCurrent.current;
      }

    },
    [
      initPublisher, 
      isPublishing,
      container,
    ]
  );

  const unpublish = useCallback(({ session }) => {
    if (publisherRef.current && isPublishing) {
      session.unpublish(publisherRef.current);
      setIsPublishing(false);
      publisherRef.current = null;
    }
  }, [isPublishing]);

  // useEffect(() => {
  //   console.log("[UsePublisher] - useEffect");
  // }, []);

  return {
    publisher: publisherRef.current,
    initPublisher,
    destroyPublisher,
    publish,
    pubInitialised,
    unpublish,
    deviceInfo
  };
}
