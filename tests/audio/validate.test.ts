import { describe, expect, it } from "vitest";
import { validateAudioFile } from "../../src/audio/validate";

function makeFile(name: string): File {
  return new File([new Uint8Array(4)], name);
}

function makeFileWithSize(name: string, sizeBytes: number): File {
  const file = makeFile(name);
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("validateAudioFile", () => {
  it.each([".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"])(
    "accepts %s files",
    (ext) => {
      expect(validateAudioFile(makeFile(`clip${ext}`))).toBeNull();
    },
  );

  it("is case-insensitive on the extension", () => {
    expect(validateAudioFile(makeFile("clip.WAV"))).toBeNull();
  });

  it("rejects unsupported extensions with a clear message", () => {
    const error = validateAudioFile(makeFile("clip.mp4"));
    expect(error).toMatch(/unsupported/i);
  });

  it("accepts a file right at the 200 MB cap", () => {
    const file = makeFileWithSize("clip.wav", 200 * 1024 * 1024);
    expect(validateAudioFile(file)).toBeNull();
  });

  it("rejects a file over the 200 MB cap with a clear message", () => {
    const file = makeFileWithSize("clip.wav", 200 * 1024 * 1024 + 1);
    const error = validateAudioFile(file);
    expect(error).toMatch(/too large/i);
  });
});
