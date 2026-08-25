import { describe, expect, it } from "vitest";
import { stitchTranscripts } from "../../src/transcription/stitch";

describe("stitchTranscripts", () => {
  it("concatenates segments from every chunk in order", () => {
    const result = stitchTranscripts([
      {
        text: "Hello there.",
        segments: [{ startMs: 0, endMs: 1000, text: "Hello there." }],
      },
      {
        text: "How are you?",
        segments: [{ startMs: 20000, endMs: 21500, text: "How are you?" }],
      },
    ]);

    expect(result.segments).toEqual([
      { startMs: 0, endMs: 1000, text: "Hello there." },
      { startMs: 20000, endMs: 21500, text: "How are you?" },
    ]);
  });

  it("joins text across seams with normalized whitespace", () => {
    const result = stitchTranscripts([
      { text: "Hello there.  ", segments: [] },
      { text: "  How are you?", segments: [] },
    ]);

    expect(result.text).toBe("Hello there. How are you?");
  });

  it("skips empty chunk text without introducing extra spaces", () => {
    const result = stitchTranscripts([
      { text: "Hello.", segments: [] },
      { text: "   ", segments: [] },
      { text: "Goodbye.", segments: [] },
    ]);

    expect(result.text).toBe("Hello. Goodbye.");
  });

  it("returns an empty transcript for no chunks", () => {
    expect(stitchTranscripts([])).toEqual({ segments: [], text: "" });
  });
});
