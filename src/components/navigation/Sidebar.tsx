import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Wordmark } from "../ui/Wordmark";
import { SidebarItem } from "./SidebarItem";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        flex: "0 0 var(--sidebar-w)",
        minHeight: "100%",
        background: "var(--surface-nav)",
        borderRight: "1px solid var(--border-subtle)",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ padding: "4px 4px 0" }}>
        <Wordmark size={17} onClick={() => navigate("/")} style={{ cursor: "pointer" }} />
      </div>

      <Button fullWidth icon={<Icon name="plus" size={16} />} onClick={() => navigate("/")}>
        New Transcription
      </Button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <SidebarItem
          icon="file-text"
          label="My Transcripts"
          active={location.pathname === "/history"}
          onClick={() => navigate("/history")}
        />
      </nav>
    </aside>
  );
}
