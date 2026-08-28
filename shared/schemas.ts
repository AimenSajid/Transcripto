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

export const userSchema = z.object({
  id: z.number(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  picture: z.string().nullable(),
});

export const googleAuthRequestSchema = z.object({
  credential: z.string().min(1),
});

export const authResponseSchema = z.object({
  user: userSchema,
});

export const meResponseSchema = z.object({
  user: userSchema.nullable(),
});

export const transcriptSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  sourceFilename: z.string().nullable(),
  durationMs: z.number(),
  language: z.string().nullable(),
  status: z.enum(["processing", "complete", "failed"]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const transcriptSchema = transcriptSummarySchema.extend({
  text: z.string(),
  segments: z.array(segmentSchema),
});

export const createTranscriptRequestSchema = z.object({
  title: z.string().min(1),
  sourceFilename: z.string().nullable().optional(),
  durationMs: z.number().nonnegative(),
  language: z.string().nullable().optional(),
  segments: z.array(segmentSchema),
});

export const updateTranscriptRequestSchema = z.object({
  title: z.string().min(1).optional(),
});

export const listTranscriptsResponseSchema = z.object({
  items: z.array(transcriptSummarySchema),
  nextCursor: z.string().nullable(),
});

export const transcriptResponseSchema = z.object({
  transcript: transcriptSchema,
});
