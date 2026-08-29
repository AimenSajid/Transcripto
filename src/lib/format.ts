export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** "X hours Y minutes" / "Y minutes" until the given future timestamp. */
export function formatCountdown(untilMs: number): string {
  const remainingMs = Math.max(0, untilMs - Date.now());
  const totalMinutes = Math.round(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

interface RowMetaSource {
  createdAt: number;
  durationMs: number;
  sourceFilename: string | null;
  language: string | null;
}

/** Dot-separated row metadata: "May 20, 2024 · 14:08 · MP3 · English". */
export function formatRowMeta(t: RowMetaSource): string {
  const date = new Date(t.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const duration = formatTimestamp(t.durationMs);
  const extension = t.sourceFilename?.split(".").pop()?.toUpperCase();

  const parts = [date, duration];
  if (extension) parts.push(extension);
  parts.push(t.language ?? "Auto-detected");

  return parts.join(" · ");
}
