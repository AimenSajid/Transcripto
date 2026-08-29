import { useRef, useState } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface DropzoneProps {
  title?: string;
  formats?: string;
  maxSize?: string;
  buttonLabel?: string;
  accept?: string;
  onFileSelected: (file: File) => void;
}

export function Dropzone({
  title = "Drop your audio file here",
  formats = "MP3, WAV, M4A, OGG, FLAC, WEBM",
  maxSize = "200MB",
  buttonLabel = "Choose File",
  accept = ".mp3,.wav,.m4a,.ogg,.flac,.webm",
  onFileSelected,
}: DropzoneProps) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelected(file);
      }}
      style={{
        border: `1.5px dashed ${over ? "var(--accent)" : "var(--border-dashed)"}`,
        background: over ? "var(--accent-soft)" : "var(--surface-sunken)",
        borderRadius: "var(--radius-dropzone)",
        padding: "40px 24px",
        textAlign: "center",
        transition: "var(--transition-control)",
        cursor: "pointer",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
      <Icon name="cloud-upload" size={38} stroke={1.5} color="var(--text-strong)" />
      <div
        style={{
          marginTop: 14,
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-bold)",
          fontSize: "var(--text-h3)",
          color: "var(--text-strong)",
          letterSpacing: "var(--ls-heading)",
        }}
      >
        {title}
      </div>
      <div style={{ margin: "10px 0", fontSize: "var(--text-sm)", color: "var(--text-subtle)" }}>
        or
      </div>
      <Button size="sm">{buttonLabel}</Button>
      <div style={{ marginTop: 16, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        Supported formats: {formats}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: "var(--text-sm)",
          fontWeight: "var(--fw-bold)",
          color: "var(--text-strong)",
        }}
      >
        Maximum file size: {maxSize}
      </div>
    </div>
  );
}
