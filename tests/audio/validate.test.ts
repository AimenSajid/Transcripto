import { describe, expect, it } from "vitest";
import { validateAudioFile } from "../../src/audio/validate";

function makeFile(name: string): File {
  return new File([new Uint8Array(4)], name);
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
});
