// Storyboard v2: what Opus writes and what the student can edit.
//
// Times are never written here. Each scene carries the words the tutor says;
// board events point at an {{anchor}} inside those words. The voice decides
// how long everything lasts, and compileTimeline() turns anchors into seconds.

import { z } from "zod";

export const BoardLine = z.object({
  /** Equation after one move. Wrap the operands of the move in [ ] to mark them. */
  text: z.string().min(1),
  /** Anchor name in the scene's `say` where the line starts writing. Omitted: right after the previous line. */
  at: z.string().optional(),
  /** Anchor where the [marked] operands invert. */
  mark: z.string().optional(),
  /** Anchor where the answer gets its inverted box. */
  answer: z.string().optional(),
  /** Anchor where the check mark lands. */
  check: z.string().optional(),
});
export type BoardLine = z.infer<typeof BoardLine>;

export const Scene = z.object({
  /** Header label, e.g. "03 — paso 1". */
  label: z.string(),
  /** Small grey side note, e.g. "// paso 1 · quita el + 3". */
  note: z.string(),
  /**
   * What the tutor says, spoken math verbalized ("resta tres en ambos lados").
   * {{name}} marks an anchor; "||" starts a new speech bubble.
   */
  say: z.string().min(1),
  /** Bubble text when it must differ from the spoken words (short, 2–5 words). */
  show: z.array(z.string()).optional(),
  board: z.array(BoardLine).default([]),
  /** Last scene: board clears and the wordmark lands. */
  outro: z.boolean().optional(),
});
export type Scene = z.infer<typeof Scene>;

export const Storyboard = z.object({
  version: z.literal(2),
  workflow: z.literal("solve-step"),
  title: z.string(),
  language: z.string().default("es-MX"),
  level: z.string().default("prepa"),
  brand: z.string().default("FINALSTUDIO"),
  fps: z.number().int().default(30),
  /** Verified answer. The build aborts if any board equation fails with it. */
  solution: z.object({ variable: z.string().length(1), value: z.number() }),
  scenes: z.array(Scene).min(2),
  outro: z.object({ wordmark: z.string(), tagline: z.string() }),
});
export type Storyboard = z.infer<typeof Storyboard>;

const ANCHOR = /\{\{([\w-]+)\}\}/g;

/** Spoken text with anchors and bubble breaks removed. */
export function spokenText(say: string): string {
  return say.replace(ANCHOR, "").replace(/\|\|/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Splits `say` into words and records, for each anchor and bubble break,
 * the index of the word that follows it.
 */
export function parseSay(say: string): { words: string[]; anchors: Record<string, number>; breaks: number[] } {
  const words: string[] = [];
  const anchors: Record<string, number> = {};
  const breaks: number[] = [0];
  for (const tok of say.split(/(\{\{[\w-]+\}\}|\|\|)|\s+/).filter(Boolean)) {
    const a = /^\{\{([\w-]+)\}\}$/.exec(tok);
    if (a) anchors[a[1]] = words.length;
    else if (tok === "||") breaks.push(words.length);
    else words.push(tok);
  }
  return { words, anchors, breaks: [...new Set(breaks)] };
}
