import type { z } from "zod";
import type {
  authResponseSchema,
  googleAuthRequestSchema,
  meResponseSchema,
  segmentSchema,
  transcribeChunkRequestSchema,
  transcribeChunkResponseSchema,
  userSchema,
} from "./schemas";

export type Segment = z.infer<typeof segmentSchema>;
export type TranscribeChunkRequest = z.infer<typeof transcribeChunkRequestSchema>;
export type TranscribeChunkResponse = z.infer<typeof transcribeChunkResponseSchema>;
export type User = z.infer<typeof userSchema>;
export type GoogleAuthRequest = z.infer<typeof googleAuthRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;

export interface ChunkResult {
  audioBase64: string;
  offsetMs: number;
  durationMs: number;
}
