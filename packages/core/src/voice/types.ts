export type WordTiming = { word: string; start: number; end: number };

export type VoiceClip = {
  /** Encoded audio (mp3 or wav). Empty for the silent estimate provider. */
  audio: Buffer;
  ext: "mp3" | "wav";
  duration: number;
  words: WordTiming[];
};

export type VoiceOptions = { language: string; voiceId?: string };

export interface VoiceProvider {
  readonly name: string;
  /** True when the provider returns real per-word times rather than estimates. */
  readonly nativeTimings: boolean;
  synthesize(text: string, opts: VoiceOptions): Promise<VoiceClip>;
}
