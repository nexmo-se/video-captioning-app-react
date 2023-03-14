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
          bottom: 10,
          right: 10,
          zIndex: 'tooltip',
        }}
        onClick={handleClickOpen()}>Transcription</Button>

      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Transcription</DialogTitle>

        <DialogContent dividers={true} >
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
            textAlign="left"
          >
            {captions.map((caption, index) => 
              <Typography key={`caption-${index}`} variant="body1" gutterBottom textAlign="left" mb={2}>
              [{caption.timestamp}] {caption.speaker}: {caption.text}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
);