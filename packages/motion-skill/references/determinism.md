# Determinism (seek-safe compositions)

The renderer seeks arbitrary frames in parallel tabs, and the checker seeks
them in different orders. Every pixel must be a pure function of time.

- One paused root timeline registered on `window.__timelines["main"]`. Child tweens are not paused.
- No `Date.now`, `performance.now`, `requestAnimationFrame` loops, `setTimeout`, CSS transitions or `@keyframes`, and no unseeded `Math.random`. Randomness happens at build time with `rng(seed)`.
- No infinite repeats (`repeat: -1`): give a count that fits the duration.
- No `onUpdate` drawing that accumulates. When something must be drawn procedurally (dither, particles, paint), bake it into images at build time and swap them with `tl.set`, or draw it as a pure function of progress on a cleared canvas.
- Text that changes every frame (timecodes, counters) is done with stepped transforms of pre-rendered strips (`ease: "steps(n)"`), never by rewriting text.
- When two `fromTo` calls target the same element, split it into nested wrappers.
- `tl.set({}, {}, DURATION)` pins the timeline length to the composition duration.
- Every asset is local: GSAP, fonts, images and audio live in `assets/`. The checker fails on any request that leaves the project.
- Load and warm fonts before frame 0 (the driver awaits `document.fonts.ready` and decodes images); a font used only late can paint frame 0 in a fallback otherwise.

## Traps the checker has caught in this project

- **Blend modes that depend on ancestors.** `mix-blend-mode: difference` on an
  answer box looked right when rendered forward and vanished after a backward
  seek: GSAP leaves `transform: translate(0,0)` on a parent after reverting a
  tween, which creates a stacking context and isolates the blend. Use a real
  fill (`background` + `z-index:-1` inside a `z-index:1` parent) instead of a blend.
- **Zero-duration sets at t = 0.** A `tl.set(..., 0)` is skipped when the
  playhead lands on 0 from 0 and applied when it arrives from later. The
  driver seeks `t + 0.1 ms` so both directions agree; in hand-written pages
  prefer CSS for the initial state and sets at > 0.
- **Crossfading captions.** Caption 1 still fading while caption 2 arrives in
  the same place: outgoing leaves before incoming arrives.
