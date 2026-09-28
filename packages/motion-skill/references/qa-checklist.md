# QA before delivering

## Automatic (must pass)

1. The builder printed its fact check (`✓ math check`, `✓ arithmetic check`…) or the facts were verified another way and written in the spec.
2. `check.mjs`: 0 errors. Read every warning; fix it or say why it stays.
3. `verify.mjs` on the MP4: expected duration, size, yuv420p, loudness within ±3 of target, true peak ≤ −1 dBTP, no black or frozen stretches.

## By eye (the sheet and the grid)

4. The first 3 s state the hook.
5. Every cell reads as a still in 1.5 s. Two neighbouring cells of one beat never look identical.
6. No text touches the character, the bubble, another line or the frame edge.
7. Marks and answers are readable (inverted, highlighted) and the numbers are right.
8. The grid from the MP4 matches the contact sheet (the render did what the page does).

## Checker findings

| Code | Means | Usual fix |
|---|---|---|
| `static_nondeterminism` | wall clock, random, rAF or timers in the page | move to build time / the timeline |
| `static_css_animation` | CSS animation/transition | animate with GSAP on the timeline |
| `static_remote_asset`, `external_request` | the page reaches the network | vendor the file into `assets/` |
| `missing_file` | a referenced file is not in the project | copy it, fix the path |
| `font_failed` | a font face failed to load | check the `@font-face` URL and the file |
| `text_off_canvas` | held text leaves the frame | smaller type, wrap, re-place; `data-layout-allow-overflow` only for entrance travel |
| `text_clipped` | text cut by its own container | widen the box or shorten the text |
| `text_overlap` | two held texts overlap | re-place, or make the outgoing one leave first |
| `text_occluded` | held text is covered by another layer (a bar, a card, an image) | move one of them, or fade the cover out before the text arrives |
| `low_contrast` (warning) | below WCAG AA for its size | darken the label or accept it for decorative labels |
| `safe_zone` (warning) | text where players draw UI | move it up/in |
| `frozen_stretch` (warning) | nothing moves for too long | keep one element alive |
| `static_video` | nothing ever changes | the timeline is not registered or never runs |
| `timeline_short` | timeline ends before the composition | `tl.set({}, {}, DURATION)` |
| `nondeterministic` | a frame depends on seek order | `references/determinism.md` traps |

Findings seen at a single sample are reported as transient notes (entrances,
exits) and never fail the check. Add `--at t1,t2` to force a moment you care about.
