import React from "react";

import { SettingsModal } from "../SettingsModal";

import { IconButton } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';

export function SettingsButton({ currentPublisher }) {
  const [ open, setOpen ] = React.useState(false);

  function toggleOpen(){
    setOpen((prev) => !prev);
  }

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="settings"
        onClick={toggleOpen}
      >
        <SettingsIcon />
      </IconButton>
      <SettingsModal 
        currentPublisher={currentPublisher}
        onCloseClick={toggleOpen}
        open={open}
      />
    </>
  );
}
