import React from "react";

import { IconButton } from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

export function VideoButton({ hasVideo, onClick }) {
  return (
    <IconButton
      edge="start"
      color="inherit"
      aria-label="videoCamera"
      onClick={onClick}
    >
      {hasVideo ? (
        <VideocamIcon fontSize="inherit" />
      ) : (
        <VideocamOffIcon fontSize="inherit" />
      )}
    </IconButton>
  );
}
