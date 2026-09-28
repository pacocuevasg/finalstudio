# Style: halftone tutor

Reference: @achxvi's Pocketsflow video (Opus 5.5, Sep 2026). White paper, a
dithered black-and-white character bleeding off the bottom-right, a speech
bubble, tiny monospace labels and a running timecode.

## Tokens

- Paper `#fff`, ink `#111`, labels `#a3a3a3`, dimmed board lines `#b9b9b9`. No other colors.
- One family: IBM Plex Mono 400/500 (vendored woff2). Labels 20 px, notes 26 px, bubble 30 px, board 64 px, wordmark 120 px.
- Frame chrome: top-left `// 0N — scene`, top-right `BRAND  00:00:SS:FF` (odometer strips stepped with `steps(fps)`), side note at left 150/196.

## The character pipeline

1. Draw the character as a **grayscale SVG** with gradients (`character/tutor.mjs`). Shading is the only thing that makes the dither look rich: light face with a shadow side, dark hair with highlights, mid-gray sweater.
2. Bake it with `engine/solve-step/tools/dither.mjs <out-dir> 3 [character.mjs]`: downsample to one sample per 3 px cell, apply an 8×8 Bayer ordered dither, upscale with hard edges. Outside the silhouette stays transparent, and inside it is opaque paper.
3. Bake one PNG per pose (mouth closed/mid/open, blink). The silhouette stays identical across poses so swaps never jump.
4. In the composition, animate only by swapping pose opacity with `tl.set` and moving the wrapper with `snap` to 4 px (use multiples of the cell size). Moving by fractions of a pixel blurs the dither.

To make a new character, write another `*.mjs` with the same `POSES` export and `tutorSVG(pose)` function, bake it, and point the spec's `"character"` at the folder holding `tutor-{open,mid,closed,blink}.png`. A photo works too: `dither.mjs <out-dir> 3 --image photo.png name 1100` (use a cut-out PNG with transparency; only use a real person's likeness with their permission).

## Motion

- Words in the bubble rise in one at a time. Board terms rise in one at a time. Never animate letter by letter.
- Marks are instant inversions (ink fill, paper text). The answer box is an ink fill that wipes left to right behind the line, then the text turns paper-white. Never a blend mode: it broke under backward seeks (`determinism.md`).
- The whole stage pushes in 3.5 % over the video, and the tutor breathes ±8 px, so no frame is frozen.
- Sound: square-wave blips per word (the "voice"), noise ticks per board term, a low thock on marks, a bell on ✓, and a soft 100 BPM pulse underneath. Everything is synthesized and license-free.
