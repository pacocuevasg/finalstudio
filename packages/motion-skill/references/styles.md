# Template catalog

Every template is `engine/styles/<name>.mjs` (or `engine/solve-step/` for the
halftone tutor), documented in `templates/<name>/spec.md`, with a working
`templates/<name>/example.json`. All 20 are deterministic, local-only, and
their examples pass `check.mjs` with 0 errors.

| Template | Look | Use it for | Fact check |
|---|---|---|---|
| `halftone-tutor` | white paper, 1-bit dithered tutor, speech bubble, mono labels, timecode (FinalStudio default) | solved exercises, short lessons with a character | board equations vs `solution` |
| `notebook-marker` | graph-paper notebook, handwriting, highlighter, circled answer | step-by-step arithmetic, proportions | line arithmetic (`vars`) |
| `editorial-serif` | cream paper, serif italics | definitions, formulas, concepts | — |
| `one-shot-morph` | one shape morphing through states, never cut | fraction → decimal → %, procedures | decimal and % computed |
| `data-counter` | rolling numbers, color cuts, bars | a spreadsheet's point | totals, %, deltas computed |
| `retro-window` | retro OS windows, pink halftone | data with a halftone look | energy/cost computed |
| `ui-cursor-demo` | generic app UI, giant cursor, camera push | spreadsheet or app procedures | formula per row (`expect`) |
| `terminal-code` | tilted light terminal that swings flat | commands, git, Python | real output only |
| `kinetic-showreel` | bold condensed type, fast cuts | hooks, intros, promos, outros | — |
| `swiss-grid` | Swiss technical poster | unit covers, syllabi, y = mx + b | line drawn from its numbers |
| `liquid-glass` | pastel liquid glass | "what you learned today" recap | ring and "x of y" from the topics |
| `split-runner` | explanation above, runner game below (16:9 and 9:16) | social review clips | formula numbers |
| `pour-layers` | a glass filling in layers | mixtures, density, recipes | density order, capacity |
| `pixel-16bit` | 16-bit pixel art | gamified primary school | sum computed |
| `felt-stopmotion` | felt stop-motion | counting and sums, primary | sum computed |
| `sand-ink` | sand animation | history timelines | — |
| `cinematic-essay` | dark constellation, fly-ins | long topics told as a chain (history of the atom) | ≤ 8 words per text |
| `collage-vox` | paper collage, sticky notes | history, geography, literature | — |
| `card-wall-3d` | 3D wall of cards | vocabulary review | target card must be in the deck |
| `talking-head-lineart` | recorded class + line drawing | teachers uploading their class | word-by-word subtitles |

Trend sources, recipes and prompts behind each look: `templates/catalog.json`
and `references/research-trending.md`. Contact sheets of every example:
`templates/_previews/<name>-sheet.jpg` (look at one before proposing a template).

If `engine/styles/` holds a template this table doesn't list, read its `templates/<name>/spec.md`.

## Choosing

1. Content decides first: a solved problem wants a board; a procedure wants
   the real interface shape; numbers want counters.
2. Audience second: younger learners → notebook/halftone tutor, slower pace;
   adults/professionals → editorial, data, UI.
3. Then platform: vertical → `split-runner` vertical or re-layout.
4. When unsure, offer a bake-off: build the same spec content in two or three
   templates, make one contact sheet each, let the user pick by eye.
