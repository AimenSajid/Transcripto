import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "error";

export interface UseAudioRecorderResult {
  status: RecorderStatus;
  elapsedMs: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<File | null>;
}

interface MimeCandidate {
  mimeType: string;
  extension: string;
}

// audio/webm (Opus) is what Chrome/Firefox produce and is already in
// validateAudioFile's allow-list; audio/mp4 (AAC) covers Safari, saved with
// an .m4a extension to match the allow-list rather than .mp4.
const MIME_CANDIDATES: MimeCandidate[] = [
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "m4a" },
];

function pickMimeType(): MimeCandidate | null {
  if (typeof MediaRecorder === "undefined") return null;
  return MIME_CANDIDATES.find((c) => MediaRecorder.isTypeSupported(c.mimeType)) ?? null;
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<MimeCandidate | null>(null);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopResolveRef = useRef<((file: File | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError(null);
    const picked = pickMimeType();
    if (!picked) {
      setError("Recording isn't supported in this browser.");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      mimeRef.current = picked;
      chunksRef.current = [];

      // Without an explicit bitrate, MediaRecorder falls back to a low
      // Opus/AAC default tuned for voice calls, not transcription accuracy.
      const recorder = new MediaRecorder(stream, {
        mimeType: picked.mimeType,
        audioBitsPerSecond: 128_000,
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const mime = mimeRef.current ?? picked;
        const blob = new Blob(chunksRef.current, { type: mime.mimeType });
        const file = new File([blob], `recording.${mime.extension}`, { type: mime.mimeType });
        cleanup();
        stopResolveRef.current?.(file);
        stopResolveRef.current = null;
      };
      recorderRef.current = recorder;

      recorder.start();
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);
      setStatus("recording");
    } catch {
      setError("Microphone access was denied or unavailable.");
      setStatus("error");
      cleanup();
    }
  }, [cleanup]);

  const stop = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      stopResolveRef.current = resolve;
      recorder.stop();
      setStatus("idle");
      setElapsedMs(0);
    });
  }, []);

  return { status, elapsedMs, error, start, stop };
}
