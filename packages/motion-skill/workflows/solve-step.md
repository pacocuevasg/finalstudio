# Workflow: solve-step (worked exercise, step by step)

Goal: in 15–30 s, the viewer watches a problem get solved one legal move at a
time, with a tutor character who says what each move is.

## Shape of the video

| Scene | Seconds | Job |
|---|---|---|
| 01 — hook | 0–4 | Tutor says "psst…" and names the pain ("¿las ecuaciones te traban?"). The hook lands inside 3 s. |
| 02 — problema | ~3 | The problem appears on the board, exactly as the student wrote it. |
| 03…n — paso k | ~4 each | One move per scene. The side note names the move, the bubble says it in plain words, the operands being applied get an inverted mark. |
| resultado | inside the last step | The answer gets an inverted box. |
| comprobación | ~3 | Substitute the answer back and show ✓. |
| cierre | ~3 | Board clears, wordmark and tagline, tutor signs off. |

## Rules

- **One move per line.** A board line is the full equation after (or while) applying one operation. Earlier lines dim so focus stays on the newest one.
- **Mark what changes.** Wrap the operands of the current move in `[ ]`; the builder inverts them at `markAt`.
- **Plain words in the bubble, math on the board.** Never repeat the equation inside the bubble.
- **Verify.** Set `solution` in the storyboard. The builder evaluates every board equation with that value and aborts on any mismatch. For non-linear problems, extend the check rather than skipping it.
- **Adapt to the learner.** Level and language change the note wording, the number of intermediate lines and the pace. Younger learners get one extra line per move and ~20% more time per scene.

## Storyboard fields (`templates/solve-step/storyboard.example.json`)

- `scenes[]`: `label` (top-left `// 01 — hook`), `start`, `note` (the side comment)
- `say[]`: `at`, `text`. Each bubble lasts until the next one.
- `board[]`: `at`, `text` with `[marked]` groups, optional `markAt`, `answerAt`, `checkAt`
- `solution`: `{ variable, value }` for the math check
- `outro`: `at`, `wordmark`, `tagline`

## Build and render

```bash
node tools/dither.mjs <project>/assets 3        # bake tutor poses once per character
node build.mjs storyboard.json <project>         # index.html + assets/sfx.wav
cd <project> && npx hyperframes lint
npx hyperframes snapshot --at 1.2,5,9.8,14.9,17.4,20.5 --no-end --describe false
npx hyperframes render -q delivery -o renders/video.mp4
```

The test render (22 s, 1080p30) took about 50 s on the cloud container.

## Next improvements

- TTS narration with word timings driving `say[]` and the mouth flaps, instead of fixed word gaps.
- Line wrapping and board scrolling for problems longer than 6 lines.
- Fractions and exponents typeset as stacked layout rather than inline `÷`.
- Portrait 1080×1920 layout for Reels and TikTok.
