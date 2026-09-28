import { elevenLabsVoice } from "./elevenlabs.ts";
import { estimateVoice } from "./estimate.ts";
import { kokoroVoice } from "./kokoro.ts";
import type { VoiceProvider } from "./types.ts";
import { voiceStudioVoice } from "./voicestudio.ts";

export type { VoiceClip, VoiceProvider, WordTiming } from "./types.ts";
export { estimateWords } from "./estimate.ts";
export { wordsFromAlignment } from "./elevenlabs.ts";
export { wavDuration } from "./voicestudio.ts";

/** VOICE_PROVIDER = estimate (default, silent) | kokoro (free, dev) | elevenlabs (production) | voicestudio (local, non-commercial) */
export function voiceFromEnv(env = process.env): VoiceProvider {
  switch (env.VOICE_PROVIDER ?? "estimate") {
    case "elevenlabs":
      return elevenLabsVoice(env);
    case "kokoro":
      return kokoroVoice(env);
    case "voicestudio":
      return voiceStudioVoice(env);
    case "estimate":
      return estimateVoice;
    default:
      throw new Error(`unknown VOICE_PROVIDER ${env.VOICE_PROVIDER}`);
  }
}
