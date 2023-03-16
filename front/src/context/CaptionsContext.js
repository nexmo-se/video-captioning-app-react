import { createContext, useState, useCallback } from "react";

export const CaptionsContext = createContext();

export function CaptionsProvider({ children }) {

  const [captions, setCaptions] = useState([]);

  const addCaptions = useCallback(
    ({ timestamp, speaker, text }) => {
      setCaptions(prev => [...prev, { timestamp, speaker, text }]);
    }
    , [setCaptions]);

  const toggleSubscribeToCaptions = useCallback(
    async (isCaptioning, subscriber) => {
      console.log(`[CaptionsProvider] - toggleSubscribeToCaptions isCaptioning ${isCaptioning}`);
      if (subscriber) {
        try {
          await subscriber.subscribeToCaptions(isCaptioning);
          console.log(`[CaptionsProvider] - subscriber.subscribeToCaptions done ${subscriber.id}`)
        } catch (err) {
          console.log(`[CaptionsProvider] - subscriber.subscribeToCaptions err`, err);
        }
      }
    }
    , []);
  
  const onCaptionReceived = useCallback(
    (event, subscriber) => {
      if (event.isFinal) {
        // console.log(`[CaptionsProvider] - onCaptionReceived`, event, subscriber.streamName || event.streamId, subscriber.streamId);
        const speaker = subscriber.streamName || event.streamId;
        setCaptions(prev => [...prev, {
          timestamp: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()}`,
          speaker: speaker,
          text: event.caption
        }]);
      }
    }, [setCaptions]);

  return (
    <CaptionsContext.Provider value={{
      captions,
      addCaptions,
      setCaptions,
      toggleSubscribeToCaptions,
      onCaptionReceived
    }}>
    {children}
  </CaptionsContext.Provider>

)}