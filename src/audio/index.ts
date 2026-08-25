import SegmenterWorker from "./segmenter.worker.ts?worker";
import { decodeAudioFile } from "./decode";
import type { ChunkResult } from "../../shared/types";

interface SegmenterWorkerResponse {
  chunks: ChunkResult[];
}

export async function segmentAudioFile(file: File): Promise<ChunkResult[]> {
  const { channelData, sampleRate } = await decodeAudioFile(file);
  const worker = new SegmenterWorker();

  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<SegmenterWorkerResponse>) => {
      worker.terminate();
      resolve(event.data.chunks);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Segmenter worker failed"));
    };
    worker.postMessage(
      { channelData, sampleRate },
      channelData.map((channel) => channel.buffer),
    );
  });
}
