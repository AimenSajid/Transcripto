import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Transcript } from "./pages/Transcript";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/transcripts/:id" element={<Transcript />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
