import { z } from "zod";

export const segmentSchema = z.object({
  startMs: z.number(),
  endMs: z.number(),
  text: z.string(),
});

export const transcribeChunkRequestSchema = z.object({
  audio: z.string().min(1),
  offsetMs: z.number().nonnegative(),
  durationMs: z.number().positive(),
  language: z.string().optional(),
});

export const transcribeChunkResponseSchema = z.object({
  segments: z.array(segmentSchema),
  text: z.string(),
});
