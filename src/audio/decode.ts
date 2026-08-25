export interface DecodedAudio {
  channelData: Float32Array[];
  sampleRate: number;
}

/**
 * decodeAudioData requires an AudioContext, which only exists on the main
 * thread (not inside a dedicated Web Worker), so this step can't move into
 * the segmenter worker alongside the rest of the pipeline.
 */
export async function decodeAudioFile(file: File): Promise<DecodedAudio> {
  const audioContext = new AudioContext();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData: Float32Array[] = [];
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      channelData.push(audioBuffer.getChannelData(channel).slice());
    }

    return { channelData, sampleRate: audioBuffer.sampleRate };
  } finally {
    await audioContext.close();
  }
}
