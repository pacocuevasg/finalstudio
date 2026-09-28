# Formats, lengths and safe zones

| Destination | Size | Length | Notes |
|---|---|---|---|
| Lesson in a platform / YouTube | 1920×1080, 30 fps | 1–6 min, split into ≤ 90 s steps | −16 LUFS, captions optional |
| Worked exercise clip | 1920×1080 | 15–40 s | one problem, one check |
| Reels, TikTok, Shorts | 1080×1920, 30 fps | 15–45 s | hook ≤ 1.5 s, −14 LUFS, captions on |
| LinkedIn / X feed | 1080×1080 or 1920×1080 | 8–30 s | first frame must read as a poster |
| Loop / GIF | any, 8 s | loop frame 0 = last frame | `render.mjs --gif` |

## Safe zones (checked by `check.mjs`)

- **16:9:** keep text above the bottom 8 % (players draw controls there) and
  inside the central 92 %.
- **9:16:** keep text out of the top 10 % and the bottom 20 % (platform UI,
  captions, buttons). Titles sit around 20–70 % of the height.
- Mark deliberate exceptions with `data-layout-allow-overflow` (entrance
  travel) or `data-layout-allow-overlap` (intentional layering) on the element.

## Changing the format

- A template that supports it takes `width`/`height` (see its `spec.md`);
  `split-runner` ships a vertical example.
- A 16:9 layout is not a 9:16 layout: re-place, don't letterbox. Stack
  vertically, enlarge type ~1.3×, one idea per screen.
- A cover as the first frame (feeds show it as the preview): frame 0 must be
  finished — no fade-in, the title already up.
