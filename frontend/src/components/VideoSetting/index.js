import React from "react";

import VideocamIcon from '@mui/icons-material/Videocam';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';

export const VideoSettings = React.memo(
  ({ hasVideo, onVideoChange }) => {
    //console.log("Video Setting", hasVideo);
    return (<>
    <List
      disablePadding
      sx={{ 
        width: '100%', 
        maxWidth: 360
      }}
    >
      <ListItem
        disablePadding>
        <ListItemIcon>
          <VideocamIcon />
        </ListItemIcon>
        <ListItemText id="switch-list-label-Video" primary="Video" />
        <Switch
          edge="end"
          checked={hasVideo}
          onChange={onVideoChange}
          name="VideoToggle"
        />
      </ListItem>
    </List>
    </>);
  }
);
