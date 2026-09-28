# QA before delivering

1. `build.mjs` printed `✓ math check` (or the facts were verified another way).
2. `npx hyperframes lint` reports 0 errors. Read the warnings.
3. There is one snapshot per scene, and in each one:
   - no text overlaps the character or the bubble
   - no line runs off the frame
   - marked operands and the answer are readable (inverted, not black on black)
   - the timecode matches the snapshot time
4. The first 3 s state the hook.
5. After rendering: `ffprobe` shows the expected duration, 1920×1080 (or 1080×1920) and AAC audio. A frame grid pulled from the MP4 looks the same as the snapshots.
6. Audio: `ffmpeg -af volumedetect`. Max below -1 dB, and nothing clipped.
