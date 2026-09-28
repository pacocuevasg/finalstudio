---
name: motion-studio
description: Make motion-design videos from code, fully offline, and verify them before delivery. Turns notes, exercises, spreadsheets, articles, procedures, code or a product brief into MP4s (tutorials, solved problems, explainers, data stories, software demos, launch clips, social shorts, loops) with bundled templates, a built-in Chrome+FFmpeg renderer, a layout/determinism checker and voice-timing tools. Use for any request to create, edit, check or render an animated or motion-graphics video.
---

# Motion Studio

You write the program that draws every frame: an HTML page with one paused
GSAP timeline. The bundled scripts seek that timeline frame by frame in
headless Chrome, check it, and encode it with FFmpeg. Nothing here calls a
service or downloads a package; GSAP, fonts and sound are in the folder.

`SKILL_DIR` is the folder holding this file. Run every script as
`node SKILL_DIR/scripts/<name>.mjs`. Talk to the user in their language.
If `scripts/` is not next to this file, the bundle is missing: ask the user
for the `motion-skill-v2` folder or zip and unpack it here before going on.

## 0. Environment (once per machine)

`node SKILL_DIR/scripts/doctor.mjs` must pass. It needs Node 18+, any
Chrome/Chromium (found automatically, or `MOTION_CHROME=/path`) and FFmpeg for
the final encode. It installs nothing; if something is missing, tell the user
the one command it prints and ask before running it.

## 1. Route the request

Match the deliverable, not a word in passing. Read only the workflow you pick.

| The user gives you | Workflow | Default template |
|---|---|---|
| An exercise to solve (math, physics, chemistry), "how do I solve this" | `workflows/solve-step.md` | `halftone-tutor`, `notebook-marker` |
| Notes, a topic, an article, a PDF to teach or explain | `workflows/explainer.md` | `editorial-serif`, `one-shot-morph`, `halftone-tutor`; history/humanities `collage-vox`, `sand-ink`, `cinematic-essay` |
| Vocabulary, flashcards, a recap of the lesson | `workflows/explainer.md` | `card-wall-3d`, `liquid-glass` |
| Primary-school counting and sums | `workflows/solve-step.md` | `felt-stopmotion`, `pixel-16bit` |
| A recorded class to dress up with drawings and subtitles | `workflows/explainer.md` | `talking-head-lineart` |
| A CSV/Excel or numbers to make a point with | `workflows/data-story.md` | `data-counter` |
| How to do something in an app or website | `workflows/software-demo.md` | `ui-cursor-demo` |
| Commands, code, a programming concept | `workflows/software-demo.md` | `terminal-code` |
| A product, feature or brand to promote | `workflows/launch-promo.md` | `kinetic-showreel` |
| A vertical clip for Reels/TikTok/Shorts | `workflows/social-short.md` | `split-runner` (vertical) |
| A short unnarrated piece: title, logo sting, stat hit, loop | `workflows/motion-graphic.md` | freeform |
| Change something in a video that exists | `workflows/revise.md` | — |
| Something no template fits | `references/custom-composition.md` | freeform |

All 20 templates, what they are for, and a contact sheet of each: `references/styles.md`.

## 2. The production loop (every workflow)

Each step has a gate. Do not start the next step until the gate holds.

1. **Brief.** One sentence: *this video tells [audience] that [message]*. Plus
   format (16:9, 9:16, 1:1), length, language, level, tone. If the user said
   "you decide", pick defaults from the workflow and say which.
   *Gate: you can state the message and the one thing the viewer can do afterwards.*
2. **Facts first.** Solve the problem, compute the numbers, pull the claims
   from the user's material *before* designing. Every number on screen comes
   from a computation or a quoted source line, never from memory.
   *Gate: facts are written down; the spec carries them in fields the builder checks.*
3. **Storyboard as a proposal.** Write the spec (`templates/<t>/example.json`
   shows each shape) and show a table: beat · seconds · on screen · why
   (`references/storyboard.md`). In a review, wait for approval; otherwise
   post it as a heads-up and continue.
   *Gate: each beat's why traces back to the message; the hook lands in 3 s.*
4. **Timing.** With narration, the audio is the clock: write `script.json`,
   run `scripts/timing.mjs` (estimate now, `--align` once a voice file with
   word timestamps exists) and write times as `"@anchor"`
   (`references/audio-voice.md`). Without narration, time to the beat grid.
5. **Build.** `node SKILL_DIR/engine/build.mjs spec.json <project> [--timing timing.json]`.
   The builder refuses wrong math and unknown anchors (exit 2): fix the spec,
   never the check.
6. **Check.** `node SKILL_DIR/scripts/check.mjs <project>`, then
   `node SKILL_DIR/scripts/sheet.mjs <project>` and *look at the sheet*.
   *Gate: 0 errors; every warning read and either fixed or explained; on the
   sheet nothing overlaps, nothing is cut, every frame reads in 1.5 s.*
7. **Render and verify the file.** `node SKILL_DIR/scripts/render.mjs <project> -o renders/<name>.mp4`
   (add `--quality draft` for a fast preview; `-o` is relative to the project), then
   `node SKILL_DIR/scripts/verify.mjs <project>/renders/<name>.mp4 --expect-duration <s>`
   and look at the grid it writes from the MP4.
   *Gate: verify passes; the grid matches the sheet.*
8. **Deliver.** The MP4, the contact sheet, the spec, and one line on how to
   change it (beat names and timecodes). Offer, don't impose: vertical cut,
   GIF (`--gif`), another template.

You cannot watch or hear the video. The sheet, the grid and the checker are
your eyes; confirm every fix with a new frame, not by rereading code.

## 3. Rules that override taste

- **Teaching videos:** `references/pedagogy.md` wins over style (signal,
  build don't pop, voice explains while the screen shows, ≤ 6 min, end with
  2–3 check questions outside the video).
- **Motion:** `references/principles.md`. Hook in 3 s, one idea per beat,
  outgoing leaves before incoming arrives, no typewriter letters (except a
  terminal), no bounce, no invented data, one element alive in every hold.
- **Not a slideshow:** `references/anti-slide.md` has mechanical tests. Fail
  one and you restructure before showing anyone.
- **Seek-safe:** `references/determinism.md`. The checker proves it; a frame
  that changes with seek order is a bug even when it looks fine.
- **Formats and safe zones:** `references/formats.md`.
- **Licenses:** every bundled asset is redistributable (`NOTICE.md`). Don't add
  fonts, music or images you can't name the license of; never copy a
  reference video's frames, logo or UI.

## 4. When you need more

| Need | Read |
|---|---|
| Write the spec and the storyboard table | `references/storyboard.md` |
| Voice, music, SFX, timing, loudness | `references/audio-voice.md` |
| Build a look no template has, or edit `index.html` by hand | `references/custom-composition.md` |
| The halftone character and dither pipeline | `references/style-halftone.md` |
| Prompts and patterns the community used with Opus | `references/prompt-patterns.md` |
| What each checker finding means and how to fix it | `references/qa-checklist.md` |
| Something broke (blank frame, wrong font, Chrome won't start) | `references/troubleshooting.md` |
| Where the ideas came from | `references/sources.md` |

## 5. Scripts

| Script | Does | Needs |
|---|---|---|
| `scripts/doctor.mjs` | reports Node, Chrome, FFmpeg; prints fixes | — |
| `engine/build.mjs` | spec → project (`index.html`, `assets/`, `meta.json`); fact checks; `@anchor` timing; voice track | Node |
| `scripts/check.mjs` | static bans, runtime errors, off-canvas/clipped/overlapping/covered text, contrast, safe zones, frozen stretches, seek-order determinism | Chrome |
| `scripts/sheet.mjs` | contact sheet at scene midpoints (`--at`, `--every`, `--frames`) | Chrome |
| `scripts/render.mjs` | frame-exact MP4, parallel tabs, audio mix + loudness to −16 LUFS, `--gif`, `--from/--to` | Chrome, FFmpeg |
| `scripts/verify.mjs` | ffprobe facts, loudness, true peak, black/frozen stretches, grid from the MP4 | FFmpeg |
| `scripts/timing.mjs` | script with `[[anchors]]` → `timing.json` (estimate or align to TTS timestamps) | Node |
| `engine/solve-step/tools/dither.mjs` | bakes halftone character poses or a photo into 1-bit PNGs | Chrome |

Projects are also valid HyperFrames projects (same `data-*` contract), so
`npx hyperframes preview` works on them when that CLI happens to be installed.
It is never required.

Maintainers: `dev/check-all.sh` builds and checks every template example.
