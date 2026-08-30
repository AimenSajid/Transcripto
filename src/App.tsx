import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import { Transcript } from "./pages/Transcript";

// Keyed by location.key so navigating to "/" while already there (e.g. the
// sidebar's "New Transcription" button) remounts Home instead of leaving
// stale pipeline/recorder state on screen — React Router doesn't remount a
// route element just because you navigated to the path you're already on.
function HomeRoute() {
  const location = useLocation();
  return <Home key={location.key} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/history" element={<History />} />
          <Route path="/transcripts/:id" element={<Transcript />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
