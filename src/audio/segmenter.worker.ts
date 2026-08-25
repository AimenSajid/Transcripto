import { downmixToMono, resampleTo16kHz } from "./resample";
import { findCutPoints } from "./cutPoints";
import { encodeWavBase64 } from "./wav";
import { SAMPLE_RATE } from "../../shared/constants";
import type { ChunkResult } from "../../shared/types";

interface SegmentRequest {
  channelData: Float32Array[];
  sampleRate: number;
}

interface SegmenterContext {
  onmessage: ((event: MessageEvent<SegmentRequest>) => void) | null;
  postMessage: (message: { chunks: ChunkResult[] }) => void;
}

// `self` is typed as Window by the DOM lib this project otherwise uses, so
// it's cast to the shape actually available inside a dedicated worker.
const ctx = self as unknown as SegmenterContext;

ctx.onmessage = (event) => {
  const { channelData, sampleRate } = event.data;

  const mono = downmixToMono(channelData);
  const resampled = resampleTo16kHz(mono, sampleRate);
  const cutPoints = findCutPoints(resampled, SAMPLE_RATE);
  const boundaries = [0, ...cutPoints, resampled.length];

  const chunks: ChunkResult[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const slice = resampled.subarray(start, end);

    chunks.push({
      audioBase64: encodeWavBase64(slice, SAMPLE_RATE),
      offsetMs: Math.round((start / SAMPLE_RATE) * 1000),
      durationMs: Math.round(((end - start) / SAMPLE_RATE) * 1000),
    });
  }

  ctx.postMessage({ chunks });
};
