import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { Wordmark } from "../ui/Wordmark";
import { SidebarItem } from "./SidebarItem";

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  function go(path: string) {
    navigate(path);
    onClose?.();
  }

  return (
    <aside
      className={`app-sidebar${open ? " is-open" : ""}`}
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ padding: "4px 4px 0" }}>
          <Wordmark size={17} onClick={() => go("/")} style={{ cursor: "pointer" }} />
        </div>
        <IconButton
          label="Close menu"
          className="mobile-menu-btn"
          onClick={() => onClose?.()}
        >
          <Icon name="x" size={18} />
        </IconButton>
      </div>

      <Button fullWidth icon={<Icon name="plus" size={16} />} onClick={() => go("/")}>
        New Transcription
      </Button>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <SidebarItem
          icon="file-text"
          label="My Transcripts"
          active={location.pathname === "/history"}
          onClick={() => go("/history")}
        />
      </nav>
    </aside>
  );
}
