import { 
  memo, 
  // useState, useRef, useCallback, useEffect 
} from "react";

import Typography from '@mui/material/Typography';

export const CaptionBar = memo(
  ({ captions, className }) => {
    return (
    <div className={className}>
      {captions.map((caption, index) => (
        <Typography key={`caption-${index}`} variant="subtitle1" gutterBottom textAlign="center" >
        {caption.text}
        </Typography> 
      ))}
    </div>);
  });