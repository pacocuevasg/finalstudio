# Workflow: social short (Reels, TikTok, Shorts)

1. 1080×1920, 15–45 s, hook inside 1.5 s, captions on, −14 LUFS
   (`render.mjs --lufs -14`).
2. Safe zones: nothing important in the top 10 % or the bottom 20 %
   (`check.mjs` warns).
3. **Template:** `split-runner` vertical (explanation above, a runner game
   below, the classic retention layout) or any template re-laid out for 9:16
   (stack, enlarge type ~1.3×, one idea per screen). Don't letterbox a 16:9.
4. One idea per video. End on the answer or a question, not a logo card.
5. Frame 0 is the poster: it must read on its own.
6. Build → check → sheet → render → verify; deliver MP4 plus the first frame as PNG
   (`sheet.mjs --at 0 --frames`).
