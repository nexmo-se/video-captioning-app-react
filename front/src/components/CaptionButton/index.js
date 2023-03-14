import React from "react";

import { IconButton } from "@mui/material";

import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionDisabledIcon from '@mui/icons-material/ClosedCaptionDisabled';

export function CaptionButton({ isCaptioning, handleClick }) {
  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="settings"
        onClick={handleClick}
      >
      {
      isCaptioning 
        ? <ClosedCaptionIcon fontSize="inherit" />
        : <ClosedCaptionDisabledIcon fontSize="inherit" />
      }
      </IconButton>
    </>
  );
}
