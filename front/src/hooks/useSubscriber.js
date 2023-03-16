import { useCallback, useState, 
  //useEffect, useContext
} from 'react';

const defaultSubscriberOptions = {
  insertMode: 'append',
  width: '100%',
  height: '100%',
  style: {
    buttonDisplayMode: 'on',
    nameDisplayMode: 'on',
  },
  showControls: true,
  fitMode: 'contain'
};

export function useSubscriber({ container, session }) {
  const [subscribers, setSubscribers] = useState([]);

  const addSubscriber = useCallback(
    (subscriber) => {
      setSubscribers((prev) => [...prev, subscriber]);
    }
    , [setSubscribers]);

  const removeSubscriber = useCallback(
    (streamId) => {
      setSubscribers((prev) =>
        prev.filter((prev) => prev.stream && prev.stream.id !== streamId)
      );
    }
    , [setSubscribers]);

  const subscribe = useCallback(
    async ( {session, streams}) => {
      if (!session || !container.current) {
        return;
      }
      const newStreamIds = streams.map(stream => stream.id);
      const oldStreamIds = subscribers.map(subscriber => subscriber.stream && subscriber.stream.id);

      oldStreamIds.forEach(oldStreamId => {
        if (!newStreamIds.includes(oldStreamId)) removeSubscriber(oldStreamId);
      });

      const finalOptions = Object.assign({}, defaultSubscriberOptions);

      return await Promise.all(streams.map(async (stream) => {
        if (!oldStreamIds.includes(stream.id)) {
          return await new Promise((resolve, reject) => {
            const subscriber = session.subscribe(
              stream,
              container.current.id,
              finalOptions, 
              (err) => {
                if (err) {
                  console.log('[useSubscriber] - session.subscribe err');
                  return reject(null);
                } else {
                  console.log('[useSubscriber] - session.subscribe done');
                  subscriber.streamName = `${subscriber.stream.name}`;
                  addSubscriber(subscriber);
                  resolve(subscriber);
                }
              }
            );
          });
        }
      }));
    }, [addSubscriber, container, removeSubscriber, subscribers]);

  return {
    subscribers,
    subscribe,
  };
}
