// Voice first, then timing: turns a v2 storyboard plus one voice clip per
// scene into the absolute-time storyboard the skill's solve-step builder reads.

import { parseSay, spokenText, type Storyboard } from "./storyboard.ts";
import type { VoiceClip, WordTiming } from "./voice/types.ts";

/** Silence before the tutor speaks in each scene. */
const LEAD_IN = 0.35;
/** Silence after the last word before the next scene. */
const TAIL = 0.7;
const MIN_SCENE = 2.5;
/** Visuals land this many frames before the word (audio report: 2 frames). */
const VISUAL_LEAD_FRAMES = 2;
/** Seconds the builder spends writing one board token. */
const TOKEN_WRITE = 0.16;

export type BuilderStoryboard = {
  brand: string;
  fps: number;
  duration: number;
  solution: Storyboard["solution"];
  scenes: { label: string; start: number; note: string }[];
  say: { at: number; text: string; wordAt?: number[] }[];
  board: { at: number; text: string; markAt?: number; answerAt?: number; checkAt?: number }[];
  outro: { at: number; wordmark: string; tagline: string };
  voice: { src: string; at: number; duration: number }[];
};

export type Chapter = { label: string; start: number; end: number };

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Aligns the provider's words to the storyboard's words. Providers can split
 * punctuation or numbers differently, so when counts differ each storyboard
 * word takes the provider word at the same relative position.
 */
function alignWords(expected: string[], got: WordTiming[]): WordTiming[] {
  if (got.length === expected.length) return got;
  if (!got.length) return expected.map((word) => ({ word, start: 0, end: 0 }));
  return expected.map((word, i) => {
    const g = got[Math.min(got.length - 1, Math.floor((i * got.length) / expected.length))];
    return { word, start: g.start, end: g.end };
  });
}

export function compileTimeline(
  sb: Storyboard,
  clips: VoiceClip[],
  audioSrc: (sceneIndex: number, clip: VoiceClip) => string | null,
): { builder: BuilderStoryboard; chapters: Chapter[] } {
  const lead = VISUAL_LEAD_FRAMES / sb.fps;
  const out: BuilderStoryboard = {
    brand: sb.brand,
    fps: sb.fps,
    duration: 0,
    solution: sb.solution,
    scenes: [],
    say: [],
    board: [],
    outro: { at: 0, ...sb.outro },
    voice: [],
  };
  const chapters: Chapter[] = [];
  let cursor = 0;

  sb.scenes.forEach((scene, i) => {
    const clip = clips[i];
    const start = cursor;
    const voiceAt = start + LEAD_IN;
    const { words, anchors, breaks } = parseSay(scene.say);
    const timed = alignWords(words, clip.words);
    const wordTime = (idx: number) => voiceAt + (idx < timed.length ? timed[idx].start : clip.duration);
    const anchorTime = (name: string | undefined) => {
      if (name == null) return undefined;
      if (!(name in anchors)) throw new Error(`scene "${scene.label}": unknown anchor {{${name}}}`);
      return r3(Math.max(start, wordTime(anchors[name]) - lead));
    };

    out.scenes.push({ label: scene.label, start: r3(start), note: scene.note });
    const src = audioSrc(i, clip);
    if (src) out.voice.push({ src, at: r3(voiceAt), duration: r3(clip.duration) });

    breaks.forEach((b, k) => {
      const end = breaks[k + 1] ?? words.length;
      const custom = scene.show?.[k];
      out.say.push({
        at: r3(Math.max(start, wordTime(b) - 0.15)),
        text: custom ?? words.slice(b, end).join(" "),
        // bubble words follow the voice only when the bubble shows the spoken words
        wordAt: custom ? undefined : timed.slice(b, end).map((w) => r3(voiceAt + w.start)),
      });
    });

    let lastEvent = voiceAt + clip.duration;
    if (scene.outro) {
      out.outro.at = r3(start);
      lastEvent = Math.max(lastEvent, start + 2.2);
    } else {
      let nextFree = start + 0.5;
      for (const line of scene.board) {
        const at = anchorTime(line.at) ?? r3(nextFree);
        const tokens = line.text.match(/\[[^\]]+\]|\S+/g)?.length ?? 1;
        const written = at + tokens * TOKEN_WRITE + 0.2;
        const markAt = anchorTime(line.mark);
        const answerAt = anchorTime(line.answer);
        const checkAt = anchorTime(line.check);
        out.board.push({ at, text: line.text, markAt, answerAt, checkAt });
        nextFree = written + 0.3;
        lastEvent = Math.max(lastEvent, written, (markAt ?? 0) + 0.4, (answerAt ?? 0) + 0.4, (checkAt ?? 0) + 0.4);
      }
    }
    cursor = r3(Math.max(start + MIN_SCENE, voiceAt + clip.duration + TAIL, lastEvent + 0.5));
    chapters.push({ label: scene.label, start: r3(start), end: cursor });
  });

  out.duration = r3(cursor + 0.4);
  return { builder: out, chapters };
}

/** The text each scene sends to the voice provider. */
export const sceneScripts = (sb: Storyboard) => sb.scenes.map((s) => spokenText(s.say));

/** WebVTT captions from the speech bubbles (the in-app captions toggle). */
export function toVtt(b: BuilderStoryboard): string {
  const ts = (t: number) => {
    const ms = Math.round(t * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
  };
  const cues = b.say.map((s, i) => `${ts(s.at)} --> ${ts(Math.min(b.say[i + 1]?.at ?? b.duration, b.duration))}\n${s.text}`);
  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}
