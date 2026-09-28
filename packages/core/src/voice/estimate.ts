// Silent provider for development and tests: no audio, word times estimated
// from syllable-ish length at a calm tutor pace (~2.6 words/s in Spanish).

import type { VoiceClip, VoiceProvider, WordTiming } from "./types.ts";

const SEC_PER_CHAR = 0.062;
const WORD_GAP = 0.06;
const PAUSE = { ",": 0.18, ";": 0.22, ".": 0.32, "?": 0.32, "!": 0.32, "…": 0.4, ":": 0.2 } as Record<string, number>;

export function estimateWords(text: string, scale = 1): WordTiming[] {
  const words: WordTiming[] = [];
  let t = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const len = Math.max(0.16, word.replace(/[^\p{L}\p{N}]/gu, "").length * SEC_PER_CHAR) * scale;
    words.push({ word, start: +t.toFixed(3), end: +(t + len).toFixed(3) });
    t += len + WORD_GAP * scale + (PAUSE[word.at(-1) ?? ""] ?? 0) * scale;
  }
  return words;
}

export const estimateVoice: VoiceProvider = {
  name: "estimate",
  nativeTimings: false,
  async synthesize(text) {
    const words = estimateWords(text);
    return { audio: Buffer.alloc(0), ext: "wav", duration: words.at(-1)?.end ?? 0, words } satisfies VoiceClip;
  },
};
