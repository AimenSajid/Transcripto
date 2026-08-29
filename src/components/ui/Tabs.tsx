interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{ display: "flex", gap: 26, borderBottom: "1px solid var(--border-subtle)" }}
    >
      {tabs.map((t) => {
        const on = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            style={{
              background: "none",
              border: "none",
              padding: "0 0 11px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              fontWeight: on ? "var(--fw-bold)" : "var(--fw-medium)",
              color: on ? "var(--text-strong)" : "var(--text-muted)",
              boxShadow: on ? "inset 0 -2px 0 var(--action-primary)" : "none",
              transition: "var(--transition-control)",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
