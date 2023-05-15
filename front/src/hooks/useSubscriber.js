import { useCallback, useState, 
  // useEffect, useContext
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

export function useSubscriber() {
  const [subscribers, setSubscribers] = useState([]);

  const addSubscriber = (subscriber) => {
    setSubscribers((prev) => [...prev, subscriber]);
  };

  const removeSubscriber = (streamId) => {
    setSubscribers((prev) =>
      prev.filter((prevSubscriber) => prevSubscriber.stream && prevSubscriber.stream.id !== streamId)
    );
  };

  const subscribe = async ( stream, session, container ) => {
    if (!session || !container) {
      return;
    }
    let finalOptions = Object.assign({}, defaultSubscriberOptions);
    return new Promise((resolve, reject) => {
      let subscriber = session.subscribe(
        stream,
        container,
        finalOptions, 
        (err) => {
          if (err) {
            console.log('[useSubscriber] - session.subscribe err');
            return reject(null);
          } else {
            // console.log('[useSubscriber] - session.subscribe done');
            subscriber.streamName = `${subscriber.stream.name}`;
            addSubscriber(subscriber);
            resolve(subscriber);
          }
        }
      );
      // subscriber.on("x", fun);
    });
  };

  return {
    subscribers,
    subscribe,
    removeSubscriber,
  };
}
