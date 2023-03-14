import React from "react";

import { IconButton } from "@mui/material";
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';

export function ScreenShareButton({ isScreensharing, onClick }) {
  return (
    <IconButton edge="start" color="inherit" aria-label="mic" onClick={onClick}>
      {isScreensharing ? (
        <StopScreenShareIcon fontSize="inherit" />
      ) : (
        <ScreenShareIcon fontSize="inherit" />
      )}
    </IconButton>
  );
}
