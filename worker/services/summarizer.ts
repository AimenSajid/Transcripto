import { summarySchema } from "../../shared/schemas";
import type { Summary } from "../../shared/types";
import { buildSummaryPrompt, SUMMARY_SYSTEM_PROMPT } from "../prompts/summary";

export const SUMMARY_MODEL = "@cf/openai/gpt-oss-20b";

function extractJson(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function requestSummary(
  ai: Ai,
  transcriptText: string,
): Promise<Summary | null> {
  const output = await ai.run(SUMMARY_MODEL, {
    messages: [
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      { role: "user", content: buildSummaryPrompt(transcriptText) },
    ],
    response_format: { type: "json_object" },
    // gpt-oss models spend part of their output budget on an internal
    // reasoning pass before the final JSON; the API's 256-token default
    // was cutting the response off mid-JSON. reasoning_effort keeps that
    // pass short so more of the budget goes to the actual answer.
    max_tokens: 2048,
    reasoning_effort: "low",
  });

  if (!("choices" in output)) return null;
  const content = output.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsedJson = extractJson(content);
  if (parsedJson === null) return null;

  const parsed = summarySchema.safeParse(parsedJson);
  return parsed.success ? parsed.data : null;
}

/**
 * Small models occasionally wrap the requested JSON in prose despite
 * response_format: json_object, so a single retry covers the common case
 * without the caller needing to know about it.
 */
export async function generateSummary(
  ai: Ai,
  transcriptText: string,
): Promise<Summary> {
  const first = await requestSummary(ai, transcriptText);
  if (first) return first;

  const retry = await requestSummary(ai, transcriptText);
  if (retry) return retry;

  throw new Error("Failed to generate a valid summary after retrying");
}
