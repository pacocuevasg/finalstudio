# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `No Chrome/Chromium found` | no browser in the usual places | install Chrome/Chromium, or `export MOTION_CHROME=/path/to/chrome` (any Playwright/Puppeteer Chromium works) |
| Chrome exits at start (Linux container) | sandbox / shared memory | the driver already passes `--no-sandbox --disable-dev-shm-usage`; check `doctor.mjs` output for the stderr tail |
| `ffmpeg not found` | FFmpeg missing | macOS `brew install ffmpeg`, Debian/Ubuntu `sudo apt-get install -y ffmpeg`, Windows `winget install ffmpeg`. build/check/sheet still work without it |
| Blank or black frames | timeline not registered, JS error, ground painted only on `#root` | `check.mjs` lists the exception; give the background its own element |
| Frame 0 in the wrong font | font face never loaded | reference the font in `@font-face` with a local URL; the driver waits for `document.fonts.ready` |
| Everything visible at once, labels stacked | page relies on clip windows (`class="clip"` + `data-start/duration`) | keep those attributes; the driver hides clips outside their window |
| Text looks blurry on the halftone character | moving by fractions of a pixel | snap to the dither cell (`snap:{x:4}`) |
| Render slow | 1080p PNG capture per frame | `--quality draft` (half size) for previews; `--workers` = CPU cores |
| Audio out of sync | timings estimated, or voice trimmed after alignment | re-run `timing.mjs --align` on the final audio file |
| Loud/quiet audio | mix not normalized | the renderer normalizes to −16 LUFS; `--lufs -14` for social |
| `external_request` for fonts.googleapis.com | a font linked from Google Fonts | use the bundled woff2 files in `engine/assets/fonts` |
