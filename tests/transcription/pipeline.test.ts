import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { transcribeChunks } from "../../src/transcription/pipeline";
import type { ChunkResult, TranscribeChunkResponse } from "../../shared/types";

function makeChunk(offsetMs: number): ChunkResult {
  return { audioBase64: "x", offsetMs, durationMs: 1000 };
}

function jsonResponse(body: TranscribeChunkResponse, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as Response;
}

describe("transcribeChunks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns results in chunk order regardless of completion order", async () => {
    const chunks = [makeChunk(0), makeChunk(1000), makeChunk(2000)];
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { offsetMs: number };
      return jsonResponse({ text: `chunk-${body.offsetMs}`, segments: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await transcribeChunks(chunks, {
      concurrency: 2,
      maxRetries: 0,
    });

    expect(results.map((r) => r.text)).toEqual([
      "chunk-0",
      "chunk-1000",
      "chunk-2000",
    ]);
  });

  it("never runs more than the configured concurrency at once", async () => {
    const chunks = [
      makeChunk(0),
      makeChunk(1000),
      makeChunk(2000),
      makeChunk(3000),
    ];
    let active = 0;
    let maxActive = 0;
    const fetchMock = vi.fn(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active--;
      return jsonResponse({ text: "ok", segments: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    await transcribeChunks(chunks, { concurrency: 2, maxRetries: 0 });

    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("retries a failing chunk with backoff before succeeding", async () => {
    const chunks = [makeChunk(0)];
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls++;
      if (calls < 3) return jsonResponse({ text: "", segments: [] }, false);
      return jsonResponse({ text: "recovered", segments: [] });
    });
    vi.stubGlobal("fetch", fetchMock);

    const promise = transcribeChunks(chunks, {
      concurrency: 1,
      maxRetries: 2,
    });
    await vi.runAllTimersAsync();
    const results = await promise;

    expect(calls).toBe(3);
    expect(results[0].text).toBe("recovered");
  });

  it("throws once retries are exhausted", async () => {
    const chunks = [makeChunk(0)];
    const fetchMock = vi.fn(async () =>
      jsonResponse({ text: "", segments: [] }, false),
    );
    vi.stubGlobal("fetch", fetchMock);

    const promise = transcribeChunks(chunks, {
      concurrency: 1,
      maxRetries: 1,
    });
    const expectation = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await expectation;
  });
});
