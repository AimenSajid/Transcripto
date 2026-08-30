import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "./navigation/Sidebar";
import { TopBar } from "./navigation/TopBar";

export function Layout() {
  const auth = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isSignedIn = auth.status === "signed-in";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-body)",
      }}
    >
      {isSignedIn && (
        <>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {sidebarOpen && (
            <div
              className="app-sidebar-backdrop"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar onMenuClick={isSignedIn ? () => setSidebarOpen(true) : undefined} />
        <Outlet />
      </div>
    </div>
  );
}
