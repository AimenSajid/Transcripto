import type { Summary } from "../../shared/types";

export async function generateSummary(
  transcriptId: number,
  regenerate = false,
): Promise<Summary> {
  const url = `/api/transcripts/${transcriptId}/summary${regenerate ? "?regenerate=1" : ""}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to generate summary: ${res.status}`);
  return (await res.json()) as Summary;
}
