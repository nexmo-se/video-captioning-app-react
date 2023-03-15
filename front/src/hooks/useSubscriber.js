import { useCallback, useState, useEffect } from "react";

const defaultSubscriberOptions = {
  insertMode: "append",
  width: "100%",
  height: "100%",
  style: {
    buttonDisplayMode: "on",
    nameDisplayMode: "on",
  },
  showControls: true,
  fitMode: 'contain'
};

export function useSubscriber( { container, session }) {
  const [subscribers, setSubscribers] = useState([]);
  const [captions, setCaptions] = useState([]);

  const toggleSubscribeToCaptions = useCallback(
    async (isCaptioning) => {
      console.log(`[useSubscriber] - toggleSubscribeToCaptions isCaptioning ${isCaptioning}`)
      for (const subscriber of subscribers) {
        try {
          if (subscriber) {
            await subscriber.subscribeToCaptions(isCaptioning);
            console.log(`[useSubscriber] - toggleSubscribeToCaptions isCaptioning ${isCaptioning} ${subscriber.id}`)
          } else {
            console.log(`[useSubscriber] - toggleSubscribeToCaptions failed subscriber === null`);
          }
        } catch (err) {
          console.log(`[useSubscriber] - toggleSubscribeToCaptions err`, err);
        }
      }
    }, [subscribers]);

  const onCaptionReceived = useCallback(
    (event) => {
      console.log(`[useSubscriber] - onCaptionReceived "${event.caption}" isFinal ${event.isFinal} streamId ${event.streamId}`);
      if (event.isFinal) {
        // setCaptions(prev => [...prev.slice(-2, prev.length), {
        //   streamId: event.streamId,
        //   text: event.caption
        // }]);
        const speaker = subscribers.find(s => s.streamId === event.streamId);
        setCaptions(prev => [...prev, {
          timestamp: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()}`,
          speaker: speaker? speaker.streamName : event.streamId,
          text: event.caption
        }]);
      }
    }, [subscribers]);

  const addSubscriber = useCallback(
    (subscriber) => {
      setSubscribers((prev) => [...prev, subscriber]);
    }
    , [subscribers]);

  const removeSubscriber = useCallback(
    ({ streamId }) => {
      setSubscribers((prev) =>
        prev.filter((prev) => prev.stream && prev.stream.id !== streamId)
      );
    }
    , []);

  const subscribe = useCallback(
    ({ session, streams, options}) => {
      if (!session || !container.current) {
        return;
      }
      const newStreamIds = streams.map(stream => stream.id);
      const oldStreamIds = subscribers.map(subscriber => subscriber.stream && subscriber.stream.id);
      
      for (const oldStreamId of oldStreamIds) {
        if (!newStreamIds.includes(oldStreamId)) {
          removeSubscriber({ streamId: oldStreamId })
        }
      }
      const finalOptions = Object.assign({}, defaultSubscriberOptions, options);
      for (const stream of streams) {
        if (!oldStreamIds.includes(stream.id)) {
          try {
            const subscriber = session.subscribe(
              stream,
              container.current.id,
              finalOptions, 
              (err) => {
                if (err) {
                  console.log("[useSubscriber] - session.subscribe err");
                }

                subscriber.streamName = `${subscriber.stream.name}`;
                addSubscriber(subscriber);
              }
            );
          } catch (e) {
            continue;
          }
        }
      }
    }, [addSubscriber, container, removeSubscriber, subscribers]);

  useEffect(() => {
    if (session && subscribers) {
      for (const subscriber of subscribers) {
        subscriber.off('captionReceived');
        subscriber.on('captionReceived', onCaptionReceived);
      }
    }

    return () => {
      if (session && subscribers) {
        for (const subscriber of subscribers) {
          subscriber.off('captionReceived');
        }
      }
    }

  }, [
    session,
    subscribers,
    onCaptionReceived,
  ]);

  return {
    subscribers: subscribers,
    subscribe,
    captions,
    toggleSubscribeToCaptions,
  };
}