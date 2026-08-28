import { describe, expect, it, vi } from "vitest";
import { generateSummary } from "../../worker/services/summarizer";

function fakeAi(...responses: Array<{ content: string | null }>) {
  const run = vi.fn();
  for (const response of responses) {
    run.mockResolvedValueOnce({
      choices: [{ message: { content: response.content } }],
    });
  }
  return { run } as unknown as Ai;
}

const VALID_JSON = JSON.stringify({
  summary: "A short summary.",
  keyPoints: ["point one", "point two"],
  actionItems: ["do the thing"],
});

describe("generateSummary", () => {
  it("parses a clean JSON response", async () => {
    const ai = fakeAi({ content: VALID_JSON });
    const summary = await generateSummary(ai, "transcript text");
    expect(summary.summary).toBe("A short summary.");
    expect(summary.keyPoints).toEqual(["point one", "point two"]);
    expect(summary.actionItems).toEqual(["do the thing"]);
  });

  it("extracts JSON wrapped in prose", async () => {
    const ai = fakeAi({
      content: `Sure, here's the summary:\n${VALID_JSON}\nLet me know if you need anything else!`,
    });
    const summary = await generateSummary(ai, "transcript text");
    expect(summary.summary).toBe("A short summary.");
  });

  it("retries once when the first response fails to parse", async () => {
    const ai = fakeAi({ content: "not json at all" }, { content: VALID_JSON });
    const summary = await generateSummary(ai, "transcript text");
    expect(summary.summary).toBe("A short summary.");
    expect(ai.run).toHaveBeenCalledTimes(2);
  });

  it("throws after both attempts fail to parse", async () => {
    const ai = fakeAi({ content: "still not json" }, { content: "nope" });
    await expect(generateSummary(ai, "transcript text")).rejects.toThrow();
  });
});
