---
name: motion-design
description: Turn notes, problems, spreadsheets or topics into short motion-design videos rendered from code with HyperFrames. Use for tutorial videos, solved exercises, explainers and launch clips, especially in the halftone "tutor" style.
---

# Motion design (FinalStudio)

Opus writes the program that draws every frame. HyperFrames seeks a paused GSAP
timeline in headless Chrome and FFmpeg encodes the result. This skill decides
*what* to show and *how it moves*; HyperFrames does the rendering.

## Route the request

| The user gives you | Workflow |
|---|---|
| A math/physics/chem exercise, a worked problem, "how do I solve this" | `workflows/solve-step.md` (implemented, template in `templates/solve-step/`) |
| Notes, an article or a topic to explain | `workflows/explainer.md` (planned) |
| A CSV/Excel to tell a story with | `workflows/data-story.md` (planned) |
| A procedure in software ("how do I do X in Excel") | `workflows/software-demo.md` (planned) |
| A product or brand to promote | `workflows/launch.md` (planned) |

When a workflow is planned but not written yet, follow `references/principles.md`
and adapt the closest template.

## Non-negotiable production loop

1. **Understand the task.** Identify the subject, the learner's level, the language, and the single thing the viewer must be able to do afterwards.
2. **Verify facts first.** Solve the problem or pull the facts *before* designing. Put the verified result in the storyboard (`solution`), and let the build fail when a board line is wrong. Never animate unverified numbers.
3. **Storyboard.** Write `storyboard.json` (scenes, speech bubbles, board lines with times). Show it to the user when they are reviewing; otherwise proceed.
4. **Voice or sound first, then timing.** When narration exists, generate it first and derive timings from word timestamps. Without TTS, speech bubbles plus the synthesized sound bed carry the rhythm.
5. **Build.** Run `node templates/solve-step/build.mjs storyboard.json <project>`.
6. **Check stills.** Run `npx hyperframes lint`, then `npx hyperframes snapshot --at <one time per scene> --no-end`, and look at every frame: overflow, overlap, legibility, correct math.
7. **Render.** Run `npx hyperframes render -q delivery -o renders/<name>.mp4`, then pull a frame grid from the MP4 with ffmpeg and look at it once more.

## Styles

- `references/style-halftone.md`: white paper, 1-bit dithered character, mono labels (`// 01 — hook`), running timecode. This is the default for FinalStudio.

## References

- `references/pedagogy.md`: rules for teaching videos (read first for any tutorial)
- `references/principles.md`: timing, easing, hierarchy, craft rules
- `references/determinism.md`: what keeps a composition seek-safe
- `references/prompt-patterns.md`: prompts that worked for the community, and how to adapt them
- `references/qa-checklist.md`: what to check before delivering

## Environment notes (cloud container)

- `cdn.jsdelivr.net` and Google Fonts are blocked here: vendor GSAP and fonts into `assets/` (npm `gsap`, `@fontsource/ibm-plex-mono`).
- Point the renderer at the preinstalled Chromium: `HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
- FFmpeg: `sudo apt-get update && sudo apt-get install -y --no-install-recommends ffmpeg`.
