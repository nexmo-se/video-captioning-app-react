import React from "react";

import MicIcon from '@mui/icons-material/Mic';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';

export const AudioSettings = React.memo(
  ({ hasAudio, onAudioChange, className }) => {
    return (<>
      <List
        disablePadding
        sx={{ 
          width: '100%', 
          maxWidth: 360
        }}
      >
        <ListItem disablePadding>
          <ListItemIcon>
            <MicIcon />
          </ListItemIcon>
          <ListItemText id="switch-list-label-Microphone" primary="Microphone" />
          <Switch
            edge="end"
            checked={hasAudio}
            onChange={onAudioChange}
            name="AudioToggle"
          />
        </ListItem>
      </List>
      </>);
  }
);
