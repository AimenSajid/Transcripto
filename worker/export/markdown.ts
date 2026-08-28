import type { Transcript } from "../../shared/types";
import { formatClockTime } from "./timestamp";

export function toMarkdown(transcript: Transcript): string {
  const lines = transcript.segments.map(
    (segment) => `**${formatClockTime(segment.startMs)}** ${segment.text}`,
  );

  return `# ${transcript.title}\n\n${lines.join("\n\n")}\n`;
}
