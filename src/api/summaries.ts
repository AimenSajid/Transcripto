import type { Summary } from "../../shared/types";

/** Reads a previously saved summary from the DB; never generates one. */
export async function getSummary(transcriptId: number): Promise<Summary | null> {
  const res = await fetch(`/api/transcripts/${transcriptId}/summary`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  return (await res.json()) as Summary;
}

export async function generateSummary(
  transcriptId: number,
  regenerate = false,
): Promise<Summary> {
  const url = `/api/transcripts/${transcriptId}/summary${regenerate ? "?regenerate=1" : ""}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to generate summary: ${res.status}`);
  return (await res.json()) as Summary;
}
