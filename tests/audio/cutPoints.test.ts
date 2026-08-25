import { describe, expect, it } from "vitest";
import { findCutPoints } from "../../src/audio/cutPoints";

const SAMPLE_RATE = 16000;

function buildSignalWithGaps(
  totalMs: number,
  gaps: { centerMs: number; widthMs: number }[],
  sampleRate = SAMPLE_RATE,
): Float32Array {
  const totalSamples = Math.round((totalMs / 1000) * sampleRate);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const ms = (i / sampleRate) * 1000;
    const inGap = gaps.some(
      (gap) => ms >= gap.centerMs - gap.widthMs / 2 && ms <= gap.centerMs + gap.widthMs / 2,
    );
    samples[i] = inGap ? 0 : Math.sin(i * 0.1) * 0.8;
  }

  return samples;
}

describe("findCutPoints", () => {
  it("returns no cuts when audio is shorter than the target chunk length", () => {
    const samples = buildSignalWithGaps(5000, [{ centerMs: 2500, widthMs: 300 }]);
    expect(findCutPoints(samples, SAMPLE_RATE)).toHaveLength(0);
  });

  it("cuts inside a quiet gap near the target chunk boundary", () => {
    const samples = buildSignalWithGaps(25000, [{ centerMs: 20300, widthMs: 400 }]);
    const cuts = findCutPoints(samples, SAMPLE_RATE, {
      targetMs: 20000,
      searchWindowMs: 1500,
    });

    expect(cuts).toHaveLength(1);
    const cutMs = (cuts[0] / SAMPLE_RATE) * 1000;
    expect(cutMs).toBeGreaterThanOrEqual(20100);
    expect(cutMs).toBeLessThanOrEqual(20500);
  });

  it("produces one cut per quiet gap for longer audio", () => {
    const gaps = [
      { centerMs: 20200, widthMs: 400 },
      { centerMs: 40100, widthMs: 400 },
    ];
    const samples = buildSignalWithGaps(45000, gaps);

    const cuts = findCutPoints(samples, SAMPLE_RATE).map(
      (index) => (index / SAMPLE_RATE) * 1000,
    );

    expect(cuts).toHaveLength(2);
    expect(cuts[0]).toBeGreaterThanOrEqual(gaps[0].centerMs - gaps[0].widthMs);
    expect(cuts[0]).toBeLessThanOrEqual(gaps[0].centerMs + gaps[0].widthMs);
    expect(cuts[1]).toBeGreaterThanOrEqual(gaps[1].centerMs - gaps[1].widthMs);
    expect(cuts[1]).toBeLessThanOrEqual(gaps[1].centerMs + gaps[1].widthMs);
  });

  it("keeps every cut within its search window of the target boundary even without a clean gap", () => {
    const totalSamples = Math.round((41000 / 1000) * SAMPLE_RATE);
    const samples = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i++) {
      samples[i] = Math.sin(i * 0.1) * 0.8;
    }

    const cuts = findCutPoints(samples, SAMPLE_RATE, {
      targetMs: 20000,
      searchWindowMs: 1500,
    });

    expect(cuts).toHaveLength(1);
    const cutMs = (cuts[0] / SAMPLE_RATE) * 1000;
    expect(cutMs).toBeGreaterThanOrEqual(18500);
    expect(cutMs).toBeLessThanOrEqual(21500);
  });
});
