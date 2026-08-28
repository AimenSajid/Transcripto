import type { Segment } from "../../shared/types";
import { formatSubtitleTimestamp } from "./timestamp";

export function toSrt(segments: Segment[]): string {
  return segments
    .map((segment, i) => {
      const start = formatSubtitleTimestamp(segment.startMs, ",");
      const end = formatSubtitleTimestamp(segment.endMs, ",");
      return `${i + 1}\n${start} --> ${end}\n${segment.text}\n`;
    })
    .join("\n");
}
