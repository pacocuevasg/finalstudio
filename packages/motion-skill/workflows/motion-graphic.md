# Workflow: short motion graphic (title, logo sting, stat hit, loop)

Unnarrated, under ~10 s, motion is the message.

1. Ask for the exact words, numbers, colors and size. Wait if a number is missing.
2. One object that changes shape carries the piece (anti-slide test 7). Write
   the start state, the end state, and the one detail that makes it premium.
3. Write a custom composition (`references/custom-composition.md`) or reuse a
   template's opening beat. 30 fps, 6–8 s for loops.
4. Loop test: frames 0 and last identical; 0, 1 s, 2.2 s all different; the
   hold (~55 %) reads as a still. `sheet.mjs --at 0,1,2.2,4.4,6.6,<last>`.
5. `check.mjs` → `render.mjs --gif` (MP4 + GIF) → `verify.mjs`.
