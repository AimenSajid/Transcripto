function pad(n: number, length = 2): string {
  return n.toString().padStart(length, "0");
}

/** HH:MM:SS,mmm (SRT) or HH:MM:SS.mmm (VTT), fixed-width and zero-padded. */
export function formatSubtitleTimestamp(ms: number, msSeparator: "," | "."): string {
  const totalMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const millis = totalMs % 1000;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${msSeparator}${pad(millis, 3)}`;
}

/** H:MM:SS or M:SS for human-readable output, without a hours segment when zero. */
export function formatClockTime(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}
