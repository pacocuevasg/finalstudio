// VoiceStudio (github.com/debpalash/VoiceStudio) through its OpenAI-compatible
// endpoint, for local experiments only: its default OmniVoice weights are
// CC-BY-NC (no commercial use) and the endpoint returns no word timings, so
// words are estimated and stretched to the real audio length.

import { estimateWords } from "./estimate.ts";
import type { VoiceClip, VoiceOptions, VoiceProvider } from "./types.ts";

export function wavDuration(wav: Buffer): number {
  // Walk RIFF chunks for "fmt " (byte rate) and "data" (length).
  let byteRate = 0;
  for (let off = 12; off + 8 <= wav.length; ) {
    const id = wav.toString("ascii", off, off + 4);
    const size = wav.readUInt32LE(off + 4);
    if (id === "fmt ") byteRate = wav.readUInt32LE(off + 16);
    if (id === "data") return byteRate ? Math.min(size, wav.length - off - 8) / byteRate : 0;
    off += 8 + size + (size % 2);
  }
  return 0;
}

export function voiceStudioVoice(env = process.env): VoiceProvider {
  const base = (env.VOICESTUDIO_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  return {
    name: "voicestudio",
    nativeTimings: false,
    async synthesize(text: string, opts: VoiceOptions): Promise<VoiceClip> {
      const res = await fetch(`${base}/v1/audio/speech`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(env.VOICESTUDIO_API_KEY ? { authorization: `Bearer ${env.VOICESTUDIO_API_KEY}` } : {}) },
        body: JSON.stringify({ model: env.VOICESTUDIO_MODEL ?? "omnivoice", input: text, voice: opts.voiceId ?? env.VOICESTUDIO_VOICE ?? "default", response_format: "wav" }),
      });
      if (!res.ok) throw new Error(`VoiceStudio ${res.status}: ${await res.text()}`);
      const audio = Buffer.from(await res.arrayBuffer());
      const duration = wavDuration(audio);
      const est = estimateWords(text);
      const scale = duration / (est.at(-1)?.end || 1);
      const words = est.map((w) => ({ word: w.word, start: +(w.start * scale).toFixed(3), end: +(w.end * scale).toFixed(3) }));
      return { audio, ext: "wav", duration, words };
    },
  };
}
