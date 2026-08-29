import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { History } from "./pages/History";
import { Login } from "./pages/Login";
import { Transcript } from "./pages/Transcript";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/transcripts/:id" element={<Transcript />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
