import {
  CHUNK_TARGET_MS,
  CHUNK_SEARCH_WINDOW_MS,
  CUT_SCAN_WINDOW_MS,
  CUT_SCAN_STEP_MS,
} from "../../shared/constants";

interface CutPointOptions {
  targetMs?: number;
  searchWindowMs?: number;
  scanWindowMs?: number;
  scanStepMs?: number;
}

/**
 * Finds sample-index cut points for slicing `samples` into ~targetMs chunks,
 * each cut placed at the quietest moment within searchWindowMs of the target
 * boundary so words aren't split mid-utterance.
 */
export function findCutPoints(
  samples: Float32Array,
  sampleRate: number,
  options: CutPointOptions = {},
): number[] {
  const targetMs = options.targetMs ?? CHUNK_TARGET_MS;
  const searchWindowMs = options.searchWindowMs ?? CHUNK_SEARCH_WINDOW_MS;
  const scanWindowMs = options.scanWindowMs ?? CUT_SCAN_WINDOW_MS;
  const scanStepMs = options.scanStepMs ?? CUT_SCAN_STEP_MS;

  const totalMs = (samples.length / sampleRate) * 1000;
  const cutPoints: number[] = [];
  let lastCutMs = 0;

  while (totalMs - lastCutMs > targetMs + searchWindowMs) {
    const targetPositionMs = lastCutMs + targetMs;
    const cutMs = findQuietestPoint(
      samples,
      sampleRate,
      targetPositionMs,
      searchWindowMs,
      scanWindowMs,
      scanStepMs,
    );
    cutPoints.push(Math.round((cutMs / 1000) * sampleRate));
    lastCutMs = cutMs;
  }

  return cutPoints;
}

function findQuietestPoint(
  samples: Float32Array,
  sampleRate: number,
  targetMs: number,
  searchWindowMs: number,
  scanWindowMs: number,
  scanStepMs: number,
): number {
  const rangeStartMs = Math.max(0, targetMs - searchWindowMs);
  const rangeEndMs = targetMs + searchWindowMs;

  let bestMs = targetMs;
  let bestRms = Infinity;

  for (
    let candidateMs = rangeStartMs;
    candidateMs <= rangeEndMs;
    candidateMs += scanStepMs
  ) {
    const rms = computeRms(samples, sampleRate, candidateMs, scanWindowMs);
    if (rms < bestRms) {
      bestRms = rms;
      bestMs = candidateMs;
    }
  }

  return bestMs;
}

function computeRms(
  samples: Float32Array,
  sampleRate: number,
  centerMs: number,
  windowMs: number,
): number {
  const halfWindowSamples = Math.round((windowMs / 2 / 1000) * sampleRate);
  const centerSample = Math.round((centerMs / 1000) * sampleRate);
  const start = Math.max(0, centerSample - halfWindowSamples);
  const end = Math.min(samples.length, centerSample + halfWindowSamples);

  if (end <= start) return Infinity;

  let sumSquares = 0;
  for (let i = start; i < end; i++) {
    sumSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumSquares / (end - start));
}
