# Custom compositions and new templates

Use a template when one fits. When none does, write either a one-off
`index.html` or a new style module that others can reuse.

## The composition contract

Anything that satisfies this renders with `scripts/render.mjs`, passes
`scripts/check.mjs`, and also runs in HyperFrames.

```html
<!doctype html>
<html lang="es"><head><meta charset="UTF-8">
<script src="assets/gsap.min.js"></script>          <!-- local copy, never a CDN -->
<style>
@font-face{font-family:"Inter";src:url(assets/fonts/inter-latin-700-normal.woff2) format("woff2");font-weight:700}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="12"
     data-width="1920" data-height="1080" data-fps="30">
  <div id="bg" style="position:absolute;inset:0;background:#f3efe6"></div>
  <h1 id="title" style="position:absolute;left:160px;top:420px;font:700 120px Inter">Hola</h1>
  <!-- optional timed clip: visible only in [start, start + duration) -->
  <div class="clip" data-start="4" data-duration="3" style="position:absolute;left:160px;top:600px">…</div>
  <audio id="sfx" class="clip" src="assets/sfx.wav" data-start="0" data-duration="12" data-volume="0.8"></audio>
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
tl.fromTo("#title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "power3.out" }, 0.3);
tl.set({}, {}, 12);                      // pin the length to data-duration
window.__timelines["main"] = tl;
</script>
</body></html>
```

- One paused root timeline on `window.__timelines["main"]`.
- The ground (background color) lives on its own full-size element, not only on `#root`.
- `<audio>` elements are mixed by the renderer from `data-start`,
  `data-duration`, `data-volume`, `data-media-start`; the page never plays them.
- Copy `engine/assets/gsap.min.js` and the fonts you use from
  `engine/assets/fonts/` into the project's `assets/`.
- Everything in `references/determinism.md` applies.

## A new style module (reusable)

`engine/styles/<name>.mjs` exports `build(spec, ctx)` and fills `ctx`:

| `ctx` field | Put in it |
|---|---|
| `css[]` | CSS strings (scoped under ids/classes of this template) |
| `html[]` | markup inside `#root` |
| `js[]` | timeline lines (`tl.fromTo(...)`) — strings, evaluated in the page |
| `sfx[]` | `{ t, kind }` sound events: `tick`, `key`, `click`, `pop`, `whoosh`, `thock`, `ding`… (see `synthWav` in `engine/lib.mjs`) |
| `fonts` | a Set of font keys from `FONTS` in `engine/lib.mjs` |
| `duration` | total seconds (required) |
| `snapshots` | times for the contact sheet (one per beat) |
| `bpm`, `bed` | pulse under the mix (0 = none) and its level |

Helpers in `engine/lib.mjs`: `esc`, `rich` (x^2, CO_2), `words()` word spans
with `*accent*`, `odometer()` rolling digits by transforms, `rng(seed)`,
`assertFact(cond, msg)` (stops the build), `synthWav`.

Then add `templates/<name>/spec.md` (fields, timings, rules) and
`example.json`, build it, and get `check.mjs` to 0 errors before calling it done.

## Loops and short motion graphics

- 6–8 s, 30 fps. Frame 0 and the last frame are identical: end every tween
  where it started, or use `repeat` counts that land exactly on the duration.
- The point reads from one still at ~55 % of the loop (the hold).
- Check frames 0, 1, 2.2, 4.4, 6.6, last: 0 and last equal; 0, 1, 2.2 all
  different (from charlie947/motion-graphics-skills, MIT).
