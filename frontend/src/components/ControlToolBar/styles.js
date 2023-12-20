import { grey } from "@mui/material/colors";

import useClasses from '../../hooks/useClasses';

export default function useStyles() {
  return useClasses({
    hidden: {
      display: "none !important",
    },
    toolbarBackground: {
      backgroundColor: grey[600],
      padding: "5px 20px",
      borderRadius: 5,
      transition: "all 0.8s ease-in",
    },
  });
}
