
import useClasses from '../../hooks/useClasses';

export default function useStyles() {
  return useClasses({
    waitingRoomVideoPreview: {
      width: '360px',
      height: '264px',
      margin: '10px 0',
    }
  });
}