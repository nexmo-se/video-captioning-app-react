import { 
  memo, 
  // useState, useRef, useCallback, useEffect 
} from "react";

import Typography from '@mui/material/Typography';

export const CaptionBar = memo(
  ({ captions, className }) => {
    return (
    <div className={className}>
      {captions.slice(-3, captions.length).map((caption, index) => (
        <Typography key={`caption-${index}`} variant="subtitle1" gutterBottom textAlign="center" >
        {caption.speaker}: {caption.text}
        </Typography> 
      ))}
    </div>);
  });