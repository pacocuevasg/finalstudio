# Audio: voice, timing, sound, loudness

The audio is the master clock. Picture follows words, never the reverse.
Sources: FinalStudio audio research (`research/audio/informe-audio.html`),
ITU-R BT.1359 (audio 45 ms early / 125 ms late is detectable), community
practice (TTS → word timestamps → timeline).

## Three levels, pick the highest the user can have

| Level | What | Needs | When |
|---|---|---|---|
| 0 · sound design | synthesized blips, ticks, whooshes, a soft pulse (built into every template) | nothing | silent loops, social clips, drafts |
| 1 · estimated voice timing | `timing.mjs` estimates word times from reading speed; bubbles/captions carry the words | nothing | storyboard review, before a voice exists |
| 2 · real narration | a voice file + word timestamps → `timing.mjs --align` → `"@anchor"` times | a TTS or a recording | the deliverable |

The skill never calls a TTS service itself. Voice is a swappable input: any
file plus timestamps works.

## The script (`script.json`)

```json
{ "lang": "es", "wps": 2.6, "lines": [
  { "say": "Tenemos [[eq]] dos equis más tres igual a once.", "show": "2x + 3 = 11" },
  { "say": "Primero [[resta]] restamos tres en ambos lados.", "show": "2x + 3 − 3 = 11 − 3" }
] }
```

- `say` is spoken text: verbalize math and symbols ("dos equis", "al cuadrado").
- `show` is the screen text. The voice explains, the screen shows: never the whole sentence on screen.
- `[[name]]` marks the moment the next word starts. Put anchors on the word
  that names the thing you animate ("*restamos*" → mark lights up).
- Spanish reads ~2.4–2.8 words/s for lessons, ~3 for social.

## Getting timestamps (pick what the user has)

| Source | Output `timing.mjs --align` reads |
|---|---|
| ElevenLabs `/text-to-speech/{voice}/with-timestamps` (production pick in this project) | the JSON response as is (`alignment.characters…`) |
| Azure Speech (WordBoundary events), cheap es-MX | `{ "words": [{ "word", "start", "end" }] }` |
| Kokoro (local, free; `hyperframes tts` or kokoro-onnx) | word list |
| A recording + forced alignment (Parakeet v3, CC-BY-4.0; Whisper with word timestamps) | word list |

Avoid for commercial use: MMS aligner (CC-BY-NC), models whose weights are
non-commercial. Align the *known script* to the audio; don't transcribe and
hope it matches.

```bash
node SKILL_DIR/scripts/timing.mjs script.json                          # estimate
node SKILL_DIR/scripts/timing.mjs script.json --align eleven.json --audio voice.mp3
node SKILL_DIR/engine/build.mjs spec.json out --timing timing.json      # spec uses "@eq", "@resta"
```

With `timing.audio` (or `spec.voice`), the builder adds the narration track
and lowers the synthesized bed to `bedUnderVoice` (0.35).

## Rules

- One audio file per scene when scenes may be re-edited; one file for the
  whole video is fine for short pieces. Re-align after any trim or tempo change.
- Picture leads the word by ~2 frames (the builder does this for anchors).
- Mouth flaps (halftone tutor): open/mid/closed poses from word start/end;
  never a mouth moving in silence.
- Music: a bed at −20 to −24 dB under voice, ducked; procedural or a track
  whose license you can name (ElevenLabs Music, your own). Avoid Suno/Udio/
  Mubert for commercial work. SFX: synthesized, or CC0 (Kenney).
- Loudness: `render.mjs` normalizes to −16 LUFS (lessons) — pass `--lufs -14`
  for social. True peak ≤ −1 dBTP. It mixes once, then compresses gently, adds
  gain and limits at 4× oversampling until the mix lands within 1 LU of the
  target (single-pass loudnorm stays ~3 LU quiet on sparse SFX beds and can
  overshoot the peak). `verify.mjs` measures both on the final MP4.
- You cannot listen. Check `verify.mjs` numbers, and draw the waveform when in
  doubt: `ffmpeg -i v.mp4 -filter_complex showwavespic=s=1600x240 -frames:v 1 wave.png`
  (no silence inside active beats, no beat pinned to the ceiling).

## One clip per scene (FinalStudio's app)

The halftone-tutor spec also accepts what FinalStudio's core writes after
generating the voice scene by scene:

- `voiceClips: [{ "src": "assets/voice/scene-01.wav", "at": 0.35, "duration": 3.2 }]`
  mounts one narration track per clip and lowers the sound bed to 0.35.
  The synthesized "talk" blips are dropped while a real voice speaks.
- `say[].wordAt: [0.47, 0.71, …]` reveals each bubble word at its TTS timestamp
  instead of the fixed word gap.
- `blinks: [2.9, 6.6, …]` overrides the automatic blink every ~3.7 s.
