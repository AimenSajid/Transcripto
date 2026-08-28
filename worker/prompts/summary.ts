export const SUMMARY_SYSTEM_PROMPT =
  "You summarize audio transcripts. Always respond with a single JSON object and nothing else — no markdown, no code fences, no commentary.";

export function buildSummaryPrompt(transcriptText: string): string {
  return `Summarize the following transcript. Respond with ONLY a JSON object of this exact shape:
{"summary": "2-4 sentence overview", "keyPoints": ["short bullet", "..."], "actionItems": ["concrete follow-up", "..."]}

Rules:
- "keyPoints" should have 3-6 items capturing the main ideas.
- "actionItems" should list concrete follow-up tasks or decisions mentioned; use an empty array if there are none.
- Do not include any text outside the JSON object.

Transcript:
"""
${transcriptText}
"""`;
}
