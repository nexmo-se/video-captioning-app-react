import "./App.css";
import { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";
// import { v4 as uuidv4 } from 'uuid';

import { WaitingRoom } from "./components/WaitingRoom";
import { VideoRoom } from "./components/VideoRoom";
import { UserContext } from "./context/UserContext";
import { CaptionsProvider } from "./context/CaptionsContext";

function App() {
  const [user, setUser] = useState({
    username: `U${ Date.now() }`,
    defaultSettings: {
      publishAudio: true,
      publishVideo: true,
    },
  });

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <Router>
      <UserContext.Provider value={value}>
        <Routes>
          <Route path="/video-room" exact element={ <CaptionsProvider><VideoRoom /></CaptionsProvider>  } />
          <Route path="/waiting-room" exact element={ <WaitingRoom /> } />
          <Route path="/" element={<Navigate replace to="/waiting-room" />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
