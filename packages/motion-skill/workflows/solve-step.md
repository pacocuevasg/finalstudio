# Workflow: solve-step (a worked exercise, one legal move at a time)

Goal: in 15–40 s the viewer watches their exact problem get solved, one move
per beat, with a tutor who says what each move is.

## Shape

| Beat | Seconds | Job |
|---|---|---|
| 01 — hook | 0–3.5 | names the pain in the learner's words ("¿las ecuaciones te traban?") |
| 02 — problema | ~3 | the problem exactly as the student wrote it |
| 03…n — paso k | ~4 each | one move per beat: side note names the move, bubble says it plainly, the operands get marked |
| resultado | inside the last step | the answer gets a box |
| comprobación | ~3 | substitute back, ✓ |
| cierre | ~3 | board clears, wordmark, tagline |

## Steps

1. **Solve it yourself first** and write every intermediate line. Count the
   moves; each becomes a beat. Set `solution` (`{variable, value}`); the
   builder evaluates every board equation with it and stops on a mismatch.
2. **Adapt to the learner.** Younger learners: one extra line per move, ~20 %
   more time per beat, simpler bubble words. Older: fewer lines, faster.
3. **Write the spec** from `templates/halftone-tutor/example.json`
   (or `templates/notebook-marker/example.json` for a notebook look):
   - `scenes[]`: `label` (`01 — hook`), `start`, `note` (`// paso 1 · quita el + 3`)
   - `say[]`: `at`, `text` — plain words, never the equation
   - `board[]`: `at`, `text` with `[marked]` operands, `markAt`, `answerAt`, `checkAt`
   - `outro`: `at`, `wordmark`, `tagline`
4. **Narration (optional):** `script.json` with one line per bubble and
   anchors on the move words; `timing.mjs`; write `"@anchor"` in `at`,
   `markAt`… and set `"duration": "auto"`.
5. **Build, check, sheet, render, verify** (SKILL.md § 2).

```bash
node SKILL_DIR/engine/build.mjs spec.json out/ecuacion [--timing timing.json]
node SKILL_DIR/scripts/check.mjs out/ecuacion
node SKILL_DIR/scripts/sheet.mjs out/ecuacion
node SKILL_DIR/scripts/render.mjs out/ecuacion -o renders/ecuacion.mp4
node SKILL_DIR/scripts/verify.mjs out/ecuacion/renders/ecuacion.mp4 --expect-duration 22
```

## Rules

- One move per line; earlier lines dim so focus stays on the newest.
- Mark what changes: `[− 3]` groups invert at `markAt`, synced to the word that names the move.
- Plain words in the bubble, math on the board. Never read the equation aloud in the bubble.
- Board ≤ 6 lines at 60 px. Longer problems: split into two videos or clear the board between phases.
- Non-linear problems (quadratics, systems, fractions): extend the check —
  substitute each root, evaluate both sides at several points — never skip it.
- A different character: draw a grayscale SVG module with the same `POSES`
  export and bake it (`references/style-halftone.md`); pass its folder as `"character"`.

The 22 s example renders in about 40 s on a 4-core cloud container.
