
import { useCallback, useEffect, useRef, useState } from "react";

import { MicButton } from "../MicButton";
import { VideoButton } from "../VideoButton";
import { CaptionButton } from "../CaptionButton";

import useStyles from "./styles";

export const ControlToolBar = ({
  className,
  hasAudio,
  hasVideo,
  handleMicButtonClick,
  handleVideoButtonClick,
  // currentPublisher,
  isCaptioning,
  subToCaptions,
  handleCaptionMicClick,
}) => {
  // This bar should include mic, camera, chat, screenshare, settings, endCall
  const [visible, setVisible] = useState(true);
  const classes = useStyles();
  const hiddenTimeoutTimer = 8000;
  let hiddenTimeout = useRef();

  const setHiddenTimeout = useCallback(() => {
    hiddenTimeout.current = setTimeout(() => {
      setVisible(false);
    }, hiddenTimeoutTimer);
  }, []);

  function handleMouseEnter() {
    clearTimeout(hiddenTimeout.current);
    setVisible(true);
  }

  function handleMouseLeave() {
    setHiddenTimeout();
  }

  useEffect(() => {
    setHiddenTimeout();
  }, [setHiddenTimeout]);

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`${classes.toolbarBackground} ${
          !visible ? classes.hidden : ""
        }`}
      >
        <MicButton
          hasAudio={hasAudio}
          onClick={handleMicButtonClick}
        ></MicButton>
        <VideoButton
          hasVideo={hasVideo}
          onClick={handleVideoButtonClick}
        ></VideoButton>
        <CaptionButton 
          isCaptioning={isCaptioning}
          subToCaptions={subToCaptions} 
          handleClick={handleCaptionMicClick} 
        />
      </div>
    </div>
  );
};
