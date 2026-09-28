# Storyboard and spec

The spec (`spec.json`) *is* the storyboard: the builder reads it, and the
table you show the user is a view of it. Change the spec, rebuild, recheck.

## The proposal you show

Open with the strategy line, then one row per beat:

> This video tells **[audience]** that **[message]**. 16:9 · 24 s · Spanish (MX) · secondary school.

| Beat | Seconds | On screen | Why |
|---|---|---|---|
| 01 — hook | 0–3.5 | "¿las ecuaciones te traban?" in the bubble | names the pain in the viewer's words |
| 02 — problema | 3.5–7 | 2x + 3 = 11 on the board | the exact exercise they brought |
| … | | | |

- **Why** traces each beat to the message. A beat whose why you cannot trace is cut, not decorated.
- The hook speaks outcome language ("resuélvelo en 3 pasos"), never the source's headings or jargon.
- Value by the second beat, evidence after (reverse iceberg; idea from HyperFrames' story spine, Apache-2.0).
- End the table with: template, palette, voice (or "sound design only"), and what you need from the user, if anything.

Changing a row here costs seconds; after the build it costs minutes.

## Spec fields every template shares

| Field | Meaning |
|---|---|
| `template` | look to build (`references/styles.md`) |
| `id` | project name (kebab-case, from the topic) |
| `lang` | `es`, `en`… (HTML lang, hyphenation) |
| `width`, `height`, `fps` | 1920×1080 at 30 unless the format says otherwise |
| `duration` | seconds, or `"auto"` with `--timing` (voice length + `tail`) |
| `brand`, `palette` | override colors by role (`ink`, `paper`, `accent`…) |
| `voice` | `{ "src": "voice.mp3", "volume": 1, "start": 0 }` narration track |
| `bedUnderVoice` | synthesized bed volume under the voice (0.35) |

Each template adds its own fields; `templates/<name>/spec.md` documents them
and `templates/<name>/example.json` is a working spec to copy.

## Times

- Seconds from the start of the video, three decimals at most.
- With narration, write `"@anchor"` or `"@anchor+0.4"` instead of a number;
  `engine/build.mjs --timing timing.json` resolves it and leads the picture by
  two frames (viewers notice late pictures more than early ones).
- Every beat starts after the previous beat's outgoing element has left.
- Reveal as the explanation reaches it: spread a beat's elements across its
  length instead of front-loading them and holding a still.

## Checkable claims

Put facts where the builder can check them, so a wrong number stops the build:

| Template | Field | Check |
|---|---|---|
| `halftone-tutor` | `solution: {variable, value}` | every board equation holds for the value |
| `notebook-marker` | `vars` | every line's arithmetic holds |
| `ui-cursor-demo` | `expect` | the formula evaluated on every row |
| `data-counter` | raw values | totals, % and deltas are computed, never typed |
| `pour-layers` | densities, volumes | layer order and capacity |
| custom | `assertFact(cond, msg)` from `engine/lib.mjs` | whatever the claim is |

For non-linear math, extend the check (substitute, compare both sides
numerically at several points) instead of skipping it.

Add `"source"` to any line that comes from the user's material (page, cell,
paragraph) so the claim can be traced back when they ask.
