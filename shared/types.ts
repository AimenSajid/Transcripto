import type { z } from "zod";
import type {
  segmentSchema,
  transcribeChunkRequestSchema,
  transcribeChunkResponseSchema,
} from "./schemas";

export type Segment = z.infer<typeof segmentSchema>;
export type TranscribeChunkRequest = z.infer<typeof transcribeChunkRequestSchema>;
export type TranscribeChunkResponse = z.infer<typeof transcribeChunkResponseSchema>;
