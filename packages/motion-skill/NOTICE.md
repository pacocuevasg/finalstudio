# Notices and licenses

Motion Studio skill (this folder): scripts, templates and docs written for
FinalStudio. Everything bundled below can be redistributed with the skill.

## Bundled third-party files

| File(s) | Author | License |
|---|---|---|
| `engine/assets/gsap.min.js` (GSAP 3.14.2) | GreenSock / Webflow | GSAP Standard "no-charge" License, https://gsap.com/standard-license (free for commercial use; may not be used to build a tool that competes with Webflow's visual animation builder) |
| `engine/assets/fonts/inter-*` | Rasmus Andersson | SIL Open Font License 1.1 (`OFL-inter.txt`) |
| `engine/assets/fonts/ibm-plex-mono-*` | IBM | SIL OFL 1.1 |
| `engine/assets/fonts/jetbrains-mono-*` | JetBrains | SIL OFL 1.1 |
| `engine/assets/fonts/instrument-serif-*` | Instrument | SIL OFL 1.1 |
| `engine/assets/fonts/anton-*` | Vernon Adams | SIL OFL 1.1 |
| `engine/assets/fonts/caveat-*` | Impallari Type | SIL OFL 1.1 |
| `engine/assets/fonts/press-start-2p-*` | CodeMan38 | SIL OFL 1.1 |
| `engine/assets/tutor/*.png`, `engine/solve-step/character/tutor.mjs` | FinalStudio | original work |
| all sound | synthesized at build time by `engine/lib.mjs` / `solve-step/build.mjs` | original work, no samples |

Fonts were taken from the `@fontsource` npm packages (OFL 1.1). Keep the OFL
text next to the fonts when redistributing (`OFL-inter.txt` covers the
license text for all of them; each font's copyright line is above).

## Ideas adapted from other skills (no code copied unless stated)

See `references/sources.md` for the full list and what each contributed.
Only ideas and rules were taken from non-commercial repositories
(video-talkcraft, MathLens without a license file, OpenMontage under AGPL).
Short rule texts adapted from MIT/Apache-2.0 skills are credited inline where
they appear.

## Note on HyperFrames

Projects produced here follow the HyperFrames composition contract
(`data-composition-id`, `data-start`, `data-duration`, `window.__timelines`),
which is documented by HeyGen under Apache-2.0. No HyperFrames code is
bundled; the renderer and checker in `scripts/` are independent implementations.
