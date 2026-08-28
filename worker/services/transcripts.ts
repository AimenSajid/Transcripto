import * as queries from "../db/queries";
import type {
  CreateTranscriptRequest,
  Segment,
  Transcript,
} from "../../shared/types";

function deriveText(segments: Segment[]): string {
  return segments
    .map((segment) => segment.text.trim())
    .filter((text) => text.length > 0)
    .join(" ");
}

export async function createTranscript(
  db: D1Database,
  userId: number,
  input: CreateTranscriptRequest,
): Promise<Transcript> {
  return queries.insertTranscript(db, userId, {
    title: input.title,
    sourceFilename: input.sourceFilename ?? null,
    durationMs: input.durationMs,
    language: input.language ?? null,
    text: deriveText(input.segments),
    segments: input.segments,
  });
}

export async function listTranscripts(
  db: D1Database,
  userId: number,
  options: queries.ListTranscriptsOptions,
) {
  return queries.listTranscriptsByUser(db, userId, options);
}

export async function getTranscript(
  db: D1Database,
  userId: number,
  id: number,
): Promise<Transcript | null> {
  return queries.getTranscriptForUser(db, userId, id);
}

export async function renameTranscript(
  db: D1Database,
  userId: number,
  id: number,
  title: string | undefined,
): Promise<Transcript | null> {
  if (title === undefined) {
    return queries.getTranscriptForUser(db, userId, id);
  }
  return queries.updateTranscriptTitle(db, userId, id, title);
}

export async function deleteTranscript(
  db: D1Database,
  userId: number,
  id: number,
): Promise<boolean> {
  return queries.deleteTranscriptForUser(db, userId, id);
}
