// Checks every board equation against the stated solution before anything is
// animated. Same rule as the skill's builder, run earlier so the app can show
// "✓ solución verificada" on the storyboard screen.

import type { Storyboard } from "./storyboard.ts";

export type VerifyResult = { ok: true } | { ok: false; line: string; left: number; right: number };

export function toJs(expr: string, variable: string, value: number): string {
  return expr
    .replace(/[\[\]]/g, "")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/×|·/g, "*")
    .replace(/\^/g, "**")
    .replace(/(\d|\))\s*\(/g, "$1*(")
    .replace(new RegExp(`(\\d|\\))\\s*${variable}`, "g"), `$1*${variable}`)
    .replace(new RegExp(variable, "g"), `(${value})`);
}

export function evaluate(expr: string, variable: string, value: number): number {
  const js = toJs(expr, variable, value);
  if (!/^[\d\s+\-*/().]*$/.test(js)) throw new Error(`unsupported expression: ${expr}`);
  return Function(`"use strict"; return (${js});`)() as number;
}

export function verifyStoryboard(sb: Storyboard): VerifyResult {
  const { variable, value } = sb.solution;
  for (const scene of sb.scenes) {
    for (const line of scene.board) {
      const plain = line.text.replace(/[\[\]]/g, "");
      if (!plain.includes("=")) continue;
      const [l, r] = plain.split("=");
      const left = evaluate(l, variable, value);
      const right = evaluate(r, variable, value);
      if (Math.abs(left - right) > 1e-9) return { ok: false, line: plain, left, right };
    }
  }
  return { ok: true };
}
