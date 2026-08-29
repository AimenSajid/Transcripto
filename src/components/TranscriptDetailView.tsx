import type { ReactNode } from "react";
import { Button } from "./ui/Button";
import { Callout } from "./ui/Callout";

interface TranscriptDetailViewProps {
  title: string;
  metaLine: string;
  saved: boolean;
  canCopy: boolean;
  copyText: string;
  exportSlot: ReactNode;
  titleSlot?: ReactNode;
  actionsExtra?: ReactNode;
  notSavedMessage?: string;
  children?: ReactNode;
}

const DEFAULT_NOT_SAVED_MESSAGE =
  "This transcript isn't saved. Signing in keeps it in your history with a summary and export options.";

export function TranscriptDetailView({
  title,
  metaLine,
  saved,
  canCopy,
  copyText,
  exportSlot,
  titleSlot,
  actionsExtra,
  notSavedMessage = DEFAULT_NOT_SAVED_MESSAGE,
  children,
}: TranscriptDetailViewProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      // Clipboard permission denied or unavailable — Copy is a convenience,
      // not a required action, so fail silently rather than show an error.
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%", maxWidth: 880 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          {titleSlot ?? (
            <h1
              style={{
                font: "var(--fw-extrabold) var(--text-h1)/1.15 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              {title}
            </h1>
          )}
          <div
            style={{
              font: "var(--fw-regular) var(--text-sm)/1.5 var(--font-body)",
              color: "var(--text-muted)",
            }}
          >
            {metaLine}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {canCopy && (
            <Button variant="ghost" onClick={() => void handleCopy()}>
              Copy
            </Button>
          )}
          {exportSlot}
          {actionsExtra}
        </div>
      </div>

      {!saved && (
        <Callout icon="lightbulb" tone="accent">
          {notSavedMessage}
        </Callout>
      )}

      {children}
    </div>
  );
}
