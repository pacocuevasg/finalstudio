// Kokoro-82M (Apache-2.0) through `hyperframes tts`: free, local, CPU-only.
// For development and previews. Needs `pip install kokoro-onnx soundfile`.
// Kokoro returns no word timings, so words are estimated and stretched to
// the real audio length; ElevenLabs is the production voice.

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { estimateWords } from "./estimate.ts";
import type { VoiceClip, VoiceOptions, VoiceProvider } from "./types.ts";
import { wavDuration } from "./voicestudio.ts";

const exec = promisify(execFile);

export function kokoroVoice(env = process.env): VoiceProvider {
  return {
    name: "kokoro",
    nativeTimings: false,
    async synthesize(text: string, opts: VoiceOptions): Promise<VoiceClip> {
      const dir = mkdtempSync(join(tmpdir(), "kokoro-"));
      const out = join(dir, "speech.wav");
      try {
        const voice = opts.voiceId ?? env.KOKORO_VOICE ?? "ef_dora";
        await exec("npx", ["--yes", "hyperframes@0.8.86", "tts", text, "-v", voice, "-s", env.KOKORO_SPEED ?? "0.95", "-o", out, "--json"], {
          env: { ...env, HYPERFRAMES_TELEMETRY_DISABLED: "1" },
        });
        const audio = readFileSync(out);
        const duration = wavDuration(audio);
        const est = estimateWords(text);
        const scale = duration / (est.at(-1)?.end || 1);
        const words = est.map((w) => ({ word: w.word, start: +(w.start * scale).toFixed(3), end: +(w.end * scale).toFixed(3) }));
        return { audio, ext: "wav", duration, words };
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  };
}
