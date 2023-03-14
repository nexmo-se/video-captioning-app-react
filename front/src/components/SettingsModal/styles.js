import useClasses from '../../hooks/useClasses';

export default function useStyles() {
  return useClasses({
    formControl: {
      marginBottom: 2
    },
    cameraSwitch: {
      display: 'flex',
      alignItems: 'center'
    },
    switchButton: {
      marginRight: 2
    },
    flex: {
      display: 'flex',
      flexDirection: 'column'
    }
  });
}