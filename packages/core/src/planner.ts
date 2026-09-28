// Notes/exercise -> verified storyboard v2 with Claude.
// The skill's own rules are the system prompt, so the product and the skill
// never drift apart. A failed math check goes back to the model once.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Storyboard } from "./storyboard.ts";
import { verifyStoryboard } from "./verify.ts";

export const PLANNER_MODEL = "claude-opus-5-5";

/** Concatenates the skill files the planner needs. */
export function loadSkillGuide(skillDir: string): string {
  return ["SKILL.md", "workflows/solve-step.md", "references/pedagogy.md", "references/style-halftone.md"]
    .map((f) => `<file path="${f}">\n${readFileSync(join(skillDir, f), "utf8")}\n</file>`)
    .join("\n\n");
}

const RULES = `You write storyboards for FinalStudio, a platform that turns a student's exercise into a short tutorial video.

Output storyboard version 2 (JSON). It differs from the builder format in the skill: there are no times.
- Each scene has "say": exactly what the tutor says aloud, with math verbalized ("resta tres en ambos lados", never "−3").
- Put {{anchor}} right before the word where something should appear on the board, and point board lines at it with "at", "mark", "answer" or "check".
- "||" inside "say" starts a new speech bubble. Use "show" only when the bubble must be shorter than what is spoken.
- One legal move per board line. Wrap the operands of the move in [ ].
- Solve the exercise yourself first and put the answer in "solution"; every board equation must hold for it.
- The last scene has "outro": true and no board lines.
- Write in the student's language and level. Keep bubbles to 2–5 words.`;

export type PlanInput = { exercise: string; level?: string; language?: string; mode?: string; guide: string };

export async function planStoryboard(input: PlanInput, client = new Anthropic()): Promise<Storyboard> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Nivel: ${input.level ?? "prepa"}\nIdioma: ${input.language ?? "es-MX"}\nModo: ${input.mode ?? "paso a paso"}\n\nEjercicio:\n${input.exercise}`,
    },
  ];
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await client.messages.parse(
      {
        model: PLANNER_MODEL,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "high", format: zodOutputFormat(Storyboard) },
        system: `${RULES}\n\n${input.guide}`,
        messages,
        // server-side fallback when a request is declined (beta)
        ...({ fallbacks: "default" } as object),
      },
      { headers: { "anthropic-beta": "server-side-fallback-2026-07-01" } },
    );
    if (response.stop_reason === "refusal") throw new Error("the model declined this exercise");
    const sb = response.parsed_output;
    if (!sb) throw new Error(`no storyboard returned (stop_reason ${response.stop_reason})`);
    const check = verifyStoryboard(sb);
    if (check.ok) return sb;
    messages.push(
      { role: "assistant", content: response.content },
      { role: "user", content: `La comprobación falló en "${check.line}": ${check.left} ≠ ${check.right}. Corrige el storyboard.` },
    );
  }
  throw new Error("storyboard failed the math check twice");
}
