import { Outlet } from "react-router-dom";
import { TopBar } from "./navigation/TopBar";

export function Layout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-body)",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}
