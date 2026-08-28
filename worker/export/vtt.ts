import type { Segment } from "../../shared/types";
import { formatSubtitleTimestamp } from "./timestamp";

export function toVtt(segments: Segment[]): string {
  const cues = segments
    .map((segment) => {
      const start = formatSubtitleTimestamp(segment.startMs, ".");
      const end = formatSubtitleTimestamp(segment.endMs, ".");
      return `${start} --> ${end}\n${segment.text}`;
    })
    .join("\n\n");

  return `WEBVTT\n\n${cues}\n`;
}
