import type { z } from "zod";
import type {
  authResponseSchema,
  createTranscriptRequestSchema,
  googleAuthRequestSchema,
  listTranscriptsResponseSchema,
  meResponseSchema,
  segmentSchema,
  transcribeChunkRequestSchema,
  transcribeChunkResponseSchema,
  transcriptResponseSchema,
  transcriptSchema,
  transcriptSummarySchema,
  updateTranscriptRequestSchema,
  userSchema,
} from "./schemas";

export type Segment = z.infer<typeof segmentSchema>;
export type TranscribeChunkRequest = z.infer<typeof transcribeChunkRequestSchema>;
export type TranscribeChunkResponse = z.infer<typeof transcribeChunkResponseSchema>;
export type User = z.infer<typeof userSchema>;
export type GoogleAuthRequest = z.infer<typeof googleAuthRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type TranscriptSummary = z.infer<typeof transcriptSummarySchema>;
export type Transcript = z.infer<typeof transcriptSchema>;
export type CreateTranscriptRequest = z.infer<typeof createTranscriptRequestSchema>;
export type UpdateTranscriptRequest = z.infer<typeof updateTranscriptRequestSchema>;
export type ListTranscriptsResponse = z.infer<typeof listTranscriptsResponseSchema>;
export type TranscriptResponse = z.infer<typeof transcriptResponseSchema>;

export interface ChunkResult {
  audioBase64: string;
  offsetMs: number;
  durationMs: number;
}
