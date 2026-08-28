import { describe, expect, it } from "vitest";
import { toMarkdown } from "../../worker/export/markdown";
import { toSrt } from "../../worker/export/srt";
import { toVtt } from "../../worker/export/vtt";
import type { Segment, Transcript } from "../../shared/types";

const segments: Segment[] = [
  { startMs: 0, endMs: 4000, text: "Hello there." },
  { startMs: 4000, endMs: 8500, text: "How are you?" },
  { startMs: 3_723_050, endMs: 3_725_000, text: "An hour in." },
];

describe("toSrt", () => {
  it("numbers cues from 1 and formats timestamps as HH:MM:SS,mmm", () => {
    const srt = toSrt(segments);
    expect(srt).toContain("1\n00:00:00,000 --> 00:00:04,000\nHello there.");
    expect(srt).toContain("2\n00:00:04,000 --> 00:00:08,500\nHow are you?");
    expect(srt).toContain("3\n01:02:03,050 --> 01:02:05,000\nAn hour in.");
  });

  it("separates cues with a blank line", () => {
    const srt = toSrt(segments.slice(0, 2));
    expect(srt).toBe(
      "1\n00:00:00,000 --> 00:00:04,000\nHello there.\n\n2\n00:00:04,000 --> 00:00:08,500\nHow are you?\n",
    );
  });
});

describe("toVtt", () => {
  it("starts with the WEBVTT header and uses dot-separated milliseconds", () => {
    const vtt = toVtt(segments.slice(0, 1));
    expect(vtt).toBe("WEBVTT\n\n00:00:00.000 --> 00:00:04.000\nHello there.\n");
  });

  it("formats an hour-plus timestamp correctly", () => {
    const vtt = toVtt(segments.slice(2));
    expect(vtt).toContain("01:02:03.050 --> 01:02:05.000");
  });
});

describe("toMarkdown", () => {
  it("renders a title heading and bold mm:ss timestamps per segment", () => {
    const transcript: Transcript = {
      id: 1,
      title: "My Recording",
      sourceFilename: "clip.wav",
      durationMs: 8500,
      language: null,
      status: "complete",
      text: "Hello there. How are you?",
      segments: segments.slice(0, 2),
      createdAt: 0,
      updatedAt: 0,
    };

    const md = toMarkdown(transcript);
    expect(md).toBe(
      "# My Recording\n\n**0:00** Hello there.\n\n**0:04** How are you?\n",
    );
  });
});
