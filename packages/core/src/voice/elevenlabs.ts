// ElevenLabs with character timestamps (the audio report's recommendation).
// Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (a LatAm Spanish voice).

import type { VoiceClip, VoiceOptions, VoiceProvider, WordTiming } from "./types.ts";

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export function wordsFromAlignment(a: Alignment): WordTiming[] {
  const words: WordTiming[] = [];
  let cur: WordTiming | null = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { word: "", start: a.character_start_times_seconds[i], end: 0 };
    cur.word += ch;
    cur.end = a.character_end_times_seconds[i];
  });
  if (cur) words.push(cur);
  return words;
}

export function elevenLabsVoice(env = process.env): VoiceProvider {
  const key = env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  const model = env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
  return {
    name: "elevenlabs",
    nativeTimings: true,
    async synthesize(text: string, opts: VoiceOptions): Promise<VoiceClip> {
      const voiceId = opts.voiceId ?? env.ELEVENLABS_VOICE_ID;
      if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID is not set");
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": key, "content-type": "application/json" },
          body: JSON.stringify({ text, model_id: model, language_code: opts.language.slice(0, 2) }),
        },
      );
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
      const body = (await res.json()) as { audio_base64: string; alignment: Alignment };
      const words = wordsFromAlignment(body.alignment);
      return { audio: Buffer.from(body.audio_base64, "base64"), ext: "mp3", duration: words.at(-1)?.end ?? 0, words };
    },
  };
}
