import { createContext, useState, useCallback } from "react";

export const CaptionsContext = createContext();

export function CaptionsProvider({ children }) {

  const [captions, setCaptions] = useState([]);

  const addCaptions = useCallback(
    ({ timestamp, speaker, text, isFinal }) => {
      setCaptions(prev => [...prev, { timestamp, speaker, text, isFinal }]);
    }
    , [setCaptions]);

  const toggleSubscribeToCaptions = useCallback(
    async (subToCaptions, subscriber) => {
      console.log(`[CaptionsProvider] - toggleSubscribeToCaptions ${subToCaptions}`);
      if (subscriber) {
        try {
          await subscriber.subscribeToCaptions(subToCaptions);
          console.log(`[CaptionsProvider] - subscriber.subscribeToCaptions done ${subToCaptions} ${subscriber.id}`)
        } catch (err) {
          console.log(`[CaptionsProvider] - subscriber.subscribeToCaptions err`, err);
        }
      }
    }
    , []);
  
  const onCaptionReceived = useCallback(
    (event, subscriber) => {
      // console.log(`[CaptionsProvider] - onCaptionReceived`, event);
      // if (event.isFinal) {
        const speaker = subscriber.streamName || event.streamId;
        setCaptions(prev => [...prev, {
          timestamp: `${(new Date()).toTimeString().split(' ')[0]}`,
          speaker: speaker,
          text: event.caption,
          isFinal: event.isFinal,
        }]);
      // }
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