import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./navigation/Sidebar";
import { TopBar } from "./navigation/TopBar";

export function Layout() {
  const auth = useAuth();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-body)",
      }}
    >
      {auth.status === "signed-in" && <Sidebar />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}
