import * as React from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export const CaptionBox = React.memo(
({ captions }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <Box>
      <Button 
        sx={{
          border: '1px solid',
          p: 1,
          borderRadius: 2,
          position: 'absolute',
          bottom: '3%',
          right: '1%',
          pt: 0,
          pb: 0,
          zIndex: 'tooltip',
        }}
        onClick={handleClickOpen()}>Transcr.</Button>
      <Dialog
        PaperProps={{ sx: { position: "fixed", top: 80, right: 10, m: 0, bottom: 80} }}
        fullWidth={true}
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog--title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog--title">Transcription</DialogTitle>
        <DialogContent dividers={true} >
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
            textAlign="left"
          ></DialogContentText>
          {captions.filter(c => c.isFinal).map((caption, index) => 
            <Typography key={`caption-${index}`} variant="body1" gutterBottom textAlign="left" >
            [{caption.timestamp}] {caption.speaker}: {caption.text}
            </Typography> 
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
);
