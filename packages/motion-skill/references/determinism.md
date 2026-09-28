# Determinism (seek-safe compositions)

The renderer jumps to arbitrary frames in parallel workers. Every pixel must be
a pure function of timeline time.

- One paused root timeline registered on `window.__timelines["main"]`. Child tweens are not paused.
- No `Date.now`, `requestAnimationFrame` loops, `setTimeout`, CSS transitions or infinite CSS keyframes, and no unseeded `Math.random`. Put randomness at build time with a seeded PRNG.
- No `onUpdate` drawing. When something must be drawn procedurally (dither, particles), bake it into images at build time and swap them with `tl.set`.
- Text that changes every frame (timecode) is done with stepped transforms of pre-rendered strips (`ease: "steps(n)"`), never by rewriting text.
- When two `fromTo` calls target the same element, split the element into nested wrappers (the lint rule `gsap_repeated_fromto_without_baseline`).
- Every asset is local: GSAP, fonts, images and audio live in `assets/`. No network in the page.
- `tl.set({}, {}, DURATION)` pins the timeline length to the composition duration.
