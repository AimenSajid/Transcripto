import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";

export function FileErrorCard({
  message,
  onChooseAnother,
}: {
  message: string;
  onChooseAnother: () => void;
}) {
  return (
    <Card padding="32px" radius="var(--radius-panel)">
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "var(--radius-circle)",
            background: "var(--red-100)",
            color: "var(--red-500)",
          }}
        >
          <Icon name="file-text" size={22} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2
              style={{
                font: "var(--fw-bold) var(--text-h3)/1.3 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              We couldn't transcribe that file
            </h2>
            <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>
              {message}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={onChooseAnother}>Choose Another File</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
