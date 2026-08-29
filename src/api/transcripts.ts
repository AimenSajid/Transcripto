import type {
  CreateTranscriptRequest,
  ListTranscriptsResponse,
  Transcript,
} from "../../shared/types";

export async function createTranscript(
  input: CreateTranscriptRequest,
): Promise<Transcript> {
  const res = await fetch("/api/transcripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save transcript: ${res.status}`);
  const data = (await res.json()) as { transcript: Transcript };
  return data.transcript;
}

export interface ListTranscriptsOptions {
  cursor?: string;
  limit?: number;
  q?: string;
}

export async function listTranscripts(
  options: ListTranscriptsOptions = {},
): Promise<ListTranscriptsResponse> {
  const params = new URLSearchParams();
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.q) params.set("q", options.q);
  const query = params.toString();

  const res = await fetch(`/api/transcripts${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error(`Failed to list transcripts: ${res.status}`);
  return (await res.json()) as ListTranscriptsResponse;
}

export async function getTranscript(id: number): Promise<Transcript> {
  const res = await fetch(`/api/transcripts/${id}`);
  if (!res.ok) throw new Error(`Failed to load transcript: ${res.status}`);
  const data = (await res.json()) as { transcript: Transcript };
  return data.transcript;
}

export async function renameTranscript(
  id: number,
  title: string,
): Promise<Transcript> {
  const res = await fetch(`/api/transcripts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to rename transcript: ${res.status}`);
  const data = (await res.json()) as { transcript: Transcript };
  return data.transcript;
}

export async function deleteTranscript(id: number): Promise<void> {
  const res = await fetch(`/api/transcripts/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete transcript: ${res.status}`);
  }
}

export type ExportFormat = "txt" | "srt" | "vtt" | "md";

export async function exportTranscript(
  id: number,
  format: ExportFormat,
): Promise<Blob> {
  const res = await fetch(`/api/transcripts/${id}/export?format=${format}`);
  if (!res.ok) throw new Error(`Failed to export transcript: ${res.status}`);
  return res.blob();
}
