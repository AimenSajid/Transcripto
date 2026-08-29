import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTranscripts } from "../api/transcripts";
import { TranscriptionRow } from "../components/TranscriptionRow";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Waveform } from "../components/ui/Waveform";
import { formatRowMeta, formatTimestamp } from "../lib/format";
import type { TranscriptSummary } from "../../shared/types";

type LoadStatus = "loading" | "done" | "error";

export function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TranscriptSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      listTranscripts({ q: query || undefined })
        .then((res) => {
          setItems(res.items);
          setStatus("done");
        })
        .catch(() => setStatus("error"));
    }, 250);

    return () => clearTimeout(handle);
  }, [query]);

  const totalDurationMs = items.reduce((sum, t) => sum + t.durationMs, 0);
  const metaLine =
    items.length === 0
      ? "Nothing saved yet"
      : `${items.length} transcript${items.length === 1 ? "" : "s"} · ${formatTimestamp(totalDurationMs)} of audio`;

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-8">
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1
              style={{
                font: "var(--fw-extrabold) var(--text-h1)/1.15 var(--font-display)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                margin: 0,
              }}
            >
              My Transcripts
            </h1>
            <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>
              {metaLine}
            </p>
          </div>
          <Button onClick={() => navigate("/")}>New Transcription</Button>
        </div>

        {status === "error" && (
          <p style={{ color: "var(--red-500)" }}>Failed to load transcripts.</p>
        )}

        {status !== "error" && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              placeholder="Search transcripts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ maxWidth: 320 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((t) => (
                <TranscriptionRow
                  key={t.id}
                  name={t.title}
                  meta={formatRowMeta(t)}
                  onClick={() => navigate(`/transcripts/${t.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {status === "done" && items.length === 0 && query === "" && (
          <Card padding="56px" radius="var(--radius-panel)">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 20,
              }}
            >
              <Waveform
                count={28}
                height={40}
                seed={12}
                progress={0}
                color="var(--sand-300)"
                style={{ width: 200 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <h2
                  style={{
                    font: "var(--type-h2)",
                    letterSpacing: "var(--ls-heading)",
                    color: "var(--text-strong)",
                    margin: 0,
                  }}
                >
                  No transcripts yet
                </h2>
                <p
                  style={{
                    font: "var(--type-body)",
                    color: "var(--text-muted)",
                    margin: 0,
                    maxWidth: "42ch",
                  }}
                >
                  Everything you transcribe from now on gets saved here with
                  its summary and export options.
                </p>
              </div>
              <Button onClick={() => navigate("/")}>New Transcription</Button>
            </div>
          </Card>
        )}

        {status === "done" && items.length === 0 && query !== "" && (
          <p style={{ color: "var(--text-muted)" }}>No transcripts match "{query}".</p>
        )}
      </div>
    </main>
  );
}
