// Script -> timing.json: the audio is the master clock.
//
//   node scripts/timing.mjs <script.json> [-o timing.json]                     estimate from reading speed (no audio yet)
//   node scripts/timing.mjs <script.json> --align <alignment.json> [--audio voice.mp3] [-o timing.json]
//
// script.json:
//   { "lang": "es", "wps": 2.6, "lines": [
//       { "say": "Primero [[resta]] resta tres en ambos lados.", "show": "2x + 3 − 3 = 11 − 3" } ] }
//   [[name]] marks an anchor: the time the NEXT word starts. "say" is what is spoken
//   (math verbalized: "dos x más tres"), "show" is what goes on screen.
//
// alignment.json, any of:
//   ElevenLabs /with-timestamps: { "alignment": { "characters": [...], "character_start_times_seconds": [...], "character_end_times_seconds": [...] } }
//   word list (Whisper, Kokoro, Azure WordBoundary, Parakeet…): { "words": [{ "word": "Primero", "start": 0.12, "end": 0.48 }, ...] }
//
// timing.json: { duration, audio?, words: [{w, start, end, line}], lines: [{start, end, say, show}], anchors: {name: t} }
// engine/build.mjs --timing timing.json then replaces "@name" in any spec time.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";

const argv = process.argv.slice(2);
const opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const scriptPath = argv[0];
if (!scriptPath) {
  console.error("usage: node scripts/timing.mjs <script.json> [--align alignment.json] [--audio file] [-o timing.json]");
  process.exit(1);
}
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const out = resolve(opt("-o") || resolve(dirname(scriptPath), "timing.json"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");

// tokens: words with anchors attached to the word that follows them
const tokens = [];
script.lines.forEach((ln, li) => {
  let pending = [];
  for (const part of ln.say.split(/\s+/).filter(Boolean)) {
    const anchors = [...part.matchAll(/\[\[([\w-]+)\]\]/g)].map((m) => m[1]);
    pending.push(...anchors);
    const w = part.replace(/\[\[[\w-]+\]\]/g, "");
    if (!w) continue;
    tokens.push({ w, line: li, anchors: pending });
    pending = [];
  }
  if (pending.length) tokens.push({ w: "", line: li, anchors: pending, tail: true });
});

let words;
let duration;
const alignPath = opt("--align");
if (alignPath) {
  const a = JSON.parse(readFileSync(alignPath, "utf8"));
  let heard;
  if (a.alignment || a.normalized_alignment) {
    const al = a.alignment || a.normalized_alignment;
    heard = [];
    let cur = null;
    al.characters.forEach((ch, i) => {
      if (/\s/.test(ch)) return (cur = null);
      if (!cur) heard.push((cur = { w: "", start: al.character_start_times_seconds[i] }));
      cur.w += ch;
      cur.end = al.character_end_times_seconds[i];
    });
  } else heard = (a.words || a.segments?.flatMap((s) => s.words) || []).map((x) => ({ w: x.word ?? x.text, start: x.start ?? x.offset, end: x.end ?? (x.offset + x.duration) }));
  // align script words to heard words (greedy with a small lookahead, tolerant to TTS normalization)
  words = [];
  let j = 0, miss = 0;
  for (const t of tokens) {
    if (t.tail) {
      words.push({ ...t, start: words.at(-1)?.end ?? 0, end: words.at(-1)?.end ?? 0 });
      continue;
    }
    let k = j;
    while (k < Math.min(heard.length, j + 4) && norm(heard[k].w) !== norm(t.w)) k++;
    if (k >= heard.length || norm(heard[k]?.w) !== norm(t.w)) (k = Math.min(j, heard.length - 1)), miss++;
    const h = heard[k];
    words.push({ ...t, start: h.start, end: h.end });
    j = k + 1;
  }
  duration = heard.at(-1)?.end ?? 0;
  if (miss) console.warn(`! ${miss} script word(s) matched loosely (TTS normalization or a changed script). Check anchors by ear.`);
} else {
  // estimate: words per second, plus pauses at punctuation and between lines
  const wps = script.wps || 2.6;
  let t = script.lead ?? 0.4;
  words = [];
  let prevLine = 0;
  for (const tk of tokens) {
    if (tk.line !== prevLine) (t += script.lineGap ?? 0.35), (prevLine = tk.line);
    if (tk.tail) {
      words.push({ ...tk, start: t, end: t });
      continue;
    }
    const len = Math.max(0.16, (tk.w.replace(/[^\p{L}\p{N}]/gu, "").length / 5.2) / wps * 1.0 + 0.08);
    words.push({ ...tk, start: +t.toFixed(3), end: +(t + len).toFixed(3) });
    t += len + (/[.!?…:]$/.test(tk.w) ? 0.45 : /[,;]$/.test(tk.w) ? 0.22 : 0.04);
  }
  duration = +t.toFixed(3);
}

const anchors = {};
for (const w of words) for (const a of w.anchors) {
  if (a in anchors) console.warn(`! anchor [[${a}]] used twice; keeping the first`);
  else anchors[a] = +w.start.toFixed(3);
}
const lines = script.lines.map((ln, li) => {
  const ws = words.filter((w) => w.line === li && !w.tail);
  return { start: ws[0]?.start ?? 0, end: ws.at(-1)?.end ?? 0, say: ln.say.replace(/\[\[[\w-]+\]\]\s*/g, ""), show: ln.show };
});
const audio = opt("--audio");
const timing = {
  mode: alignPath ? "aligned" : "estimated",
  duration: +duration.toFixed(3),
  ...(audio ? { audio: relative(dirname(out), resolve(audio)) } : {}),
  anchors,
  lines,
  words: words.filter((w) => !w.tail).map((w) => ({ w: w.w, start: +w.start.toFixed(3), end: +w.end.toFixed(3), line: w.line })),
};
writeFileSync(out, JSON.stringify(timing, null, 2));
console.log(`✓ ${out} · ${timing.mode} · ${timing.duration}s · ${Object.keys(anchors).length} anchors: ${Object.entries(anchors).map(([k, v]) => `${k}@${v}`).join(" ")}`);
