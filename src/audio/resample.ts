import { SAMPLE_RATE } from "../../shared/constants";

export function downmixToMono(channelData: Float32Array[]): Float32Array {
  if (channelData.length === 1) return channelData[0];

  const length = channelData[0].length;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    let sum = 0;
    for (const channel of channelData) sum += channel[i];
    mono[i] = sum / channelData.length;
  }
  return mono;
}

export function resampleTo16kHz(
  samples: Float32Array,
  originalSampleRate: number,
): Float32Array {
  if (originalSampleRate === SAMPLE_RATE) return samples;

  const ratio = originalSampleRate / SAMPLE_RATE;
  const newLength = Math.round(samples.length / ratio);
  const resampled = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = i * ratio;
    const indexFloor = Math.floor(sourceIndex);
    const indexCeil = Math.min(indexFloor + 1, samples.length - 1);
    const fraction = sourceIndex - indexFloor;
    resampled[i] =
      samples[indexFloor] * (1 - fraction) + samples[indexCeil] * fraction;
  }

  return resampled;
}
