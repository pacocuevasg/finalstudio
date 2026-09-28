// solve-step builder: storyboard.json -> HyperFrames project (index.html + sfx.wav).
//
//   node build.mjs <storyboard.json> <project-dir>
//
// The project dir must already hold assets/tutor-*.png (tools/dither.mjs),
// assets/gsap.min.js and assets/fonts/plex-mono-{400,500}.woff2.
// Everything is computed here at build time; the page only replays a paused
// GSAP timeline, so any frame can be seeked and rendered in any order.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [sbPath, outDir] = process.argv.slice(2);
if (!sbPath || !outDir) {
  console.error("usage: node build.mjs <storyboard.json> <project-dir>");
  process.exit(1);
}
const sb = JSON.parse(readFileSync(sbPath, "utf8"));
const FPS = sb.fps || 30;
const DUR = sb.duration;
// One narration clip per scene ({ src, at, duration }), as FinalStudio's core writes them.
const voiceClips = sb.voiceClips || [];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const f2 = (n) => String(n).padStart(2, "0");

// ---------- 1. verify the math before animating anything ----------
// Every board line that is an equation must hold for the stated solution.
if (sb.solution) {
  const { variable, value } = sb.solution;
  for (const line of sb.board) {
    const plain = line.text.replace(/[\[\]]/g, "");
    if (!plain.includes("=")) continue;
    const toJs = (s) =>
      s
        .replace(/−/g, "-")
        .replace(/÷/g, "/")
        .replace(/×|·/g, "*")
        .replace(/(\d)\s*\(/g, "$1*(")
        .replace(new RegExp(`(\\d)${variable}`, "g"), `$1*${variable}`)
        .replace(new RegExp(variable, "g"), `(${value})`);
    const [l, r] = plain.split("=").map((s) => Function(`return (${toJs(s)})`)());
    if (Math.abs(l - r) > 1e-9) {
      console.error(`✗ math check failed on "${plain}": ${l} ≠ ${r}`);
      process.exit(2);
    }
  }
  console.log(`✓ math check: every board line holds for ${variable} = ${value}`);
}

// ---------- 2. layout constants ----------
const BOARD = { x: 150, y: 370, lh: 96, size: 60 };
const TUTOR = { x: 955, y: 12, w: 1000, h: 1125 };
const BUBBLE = { right: 1236, top: 560 };

// ---------- 3. build DOM + timeline + sfx events ----------
const html = [];
const js = [];
const sfx = []; // {t, kind, p}

// words reveal one by one: short rise on a hold, never a per-letter typewriter.
const WORD_GAP = 0.13;

// scene header labels and side notes
sb.scenes.forEach((s, i) => {
  const end = sb.scenes[i + 1]?.start ?? DUR;
  html.push(
    `<div class="hdr-l clip" data-start="${s.start}" data-duration="${(end - s.start).toFixed(3)}" data-track-index="1">// ${esc(s.label)}</div>`,
    `<div id="note${i}" class="note clip" data-start="${s.start}" data-duration="${(end - s.start).toFixed(3)}" data-track-index="2">${esc(s.note)}</div>`
  );
  js.push(`tl.fromTo("#note${i}", {opacity:0, x:-12}, {opacity:1, x:0, duration:.35, ease:"power2.out"}, ${s.start + 0.15});`);
});

// speech bubbles + mouth flaps
const mouthCycle = ["mid", "open", "mid", "closed", "open", "mid"];
const mouthKeys = []; // [t, pose]
sb.say.forEach((b, i) => {
  const end = sb.say[i + 1]?.at ?? DUR;
  const words = b.text.split(" ");
  html.push(
    `<div id="bub${i}" class="bubble clip" data-start="${b.at}" data-duration="${(end - b.at).toFixed(3)}" data-track-index="3">` +
      words.map((w, k) => `<span class="w" id="bw${i}_${k}">${esc(w)}</span>`).join(" ") +
      `<svg class="tail" viewBox="0 0 40 30" width="40" height="30"><path d="M0 2 C14 4 26 14 38 28 C26 22 14 20 0 20" fill="#fff" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/></svg></div>`
  );
  js.push(`tl.fromTo("#bub${i}", {scale:.86, opacity:0}, {scale:1, opacity:1, duration:.28, ease:"back.out(1.6)"}, ${b.at});`);
  sfx.push({ t: b.at, kind: "pop" });
  words.forEach((w, k) => {
    // b.wordAt (TTS word timestamps) wins over the fixed word gap
    const t = b.wordAt?.[k] ?? b.at + 0.12 + k * WORD_GAP * Math.max(1, w.length / 5);
    js.push(`tl.fromTo("#bw${i}_${k}", {opacity:0, y:6}, {opacity:1, y:0, duration:.12, ease:"power1.out"}, ${t.toFixed(3)});`);
    // two mouth flaps per word, spaced on 2-frame holds
    for (let f = 0; f < 2; f++) {
      mouthKeys.push([t + f * 0.066, mouthCycle[(i + k + f) % mouthCycle.length]]);
      // with a real voice the synthesized "talk" blips would fight it
      if (!voiceClips.length) sfx.push({ t: t + f * 0.066, kind: "blip", p: (w.charCodeAt(0) * 7 + f * 13 + k * 5) % 9 });
    }
    mouthKeys.push([t + 0.14, "closed"]);
  });
});

// blinks at fixed beats
// sb.blinks overrides; otherwise one blink every ~3.7 s for the whole video
const blinkTimes = sb.blinks ?? Array.from({ length: Math.floor(DUR / 3.7) }, (_, i) => +(2.9 + i * 3.7 + (i % 2) * 0.4).toFixed(2)).filter((t) => t < DUR - 0.2);

// the board
const lineIds = [];
sb.board.forEach((ln, i) => {
  const y = BOARD.y + i * BOARD.lh;
  // tokens: words, with [bracketed] groups kept as one mark token
  const parts = ln.text.match(/\[[^\]]+\]|\S+/g);
  let markIdx = 0;
  const tokHtml = parts
    .map((p, k) => {
      if (p.startsWith("[")) {
        const id = `m${i}_${markIdx++}`;
        return `<span class="tok mark" id="t${i}_${k}"><span class="mk" id="${id}">${esc(p.slice(1, -1))}</span></span>`;
      }
      return `<span class="tok" id="t${i}_${k}">${esc(p)}</span>`;
    })
    .join(" ");
  const extra =
    (ln.answerAt != null ? `<span class="box" id="box${i}"></span>` : "") +
    (ln.checkAt != null ? `<span class="check" id="chk${i}">✓</span>` : "");
  html.push(`<div class="line" id="ln${i}" style="top:${y}px">${tokHtml}${extra}</div>`);
  lineIds.push(`#ln${i}`);
  parts.forEach((p, k) => {
    const t = ln.at + k * 0.16;
    js.push(`tl.fromTo("#t${i}_${k}", {opacity:0, y:14}, {opacity:1, y:0, duration:.18, ease:"power2.out"}, ${t.toFixed(3)});`);
    sfx.push({ t, kind: "tick", p: k });
  });
  // dim earlier lines when a new one starts, so focus stays on the newest step
  if (i > 0 && sb.board[i - 1].answerAt == null) js.push(`tl.to("#ln${i - 1}", {color:"#b9b9b9", duration:.3}, ${ln.at});`);
  if (ln.markAt != null) {
    for (let m = 0; m < markIdx; m++)
      js.push(`tl.to("#m${i}_${m}", {backgroundColor:"#111", color:"#fff", duration:.01}, ${(ln.markAt + m * 0.18).toFixed(3)});`);
    sfx.push({ t: ln.markAt, kind: "thock" }, { t: ln.markAt + 0.18, kind: "thock" });
  }
  if (ln.answerAt != null) {
    js.push(`tl.fromTo("#box${i}", {scaleX:0}, {scaleX:1, duration:.32, ease:"power3.inOut"}, ${ln.answerAt});`);
    js.push(`tl.to("#ln${i}", {color:"#fff", duration:.12}, ${ln.answerAt + 0.14});`);
    sfx.push({ t: ln.answerAt, kind: "thock" });
  }
  if (ln.checkAt != null) {
    js.push(`tl.fromTo("#chk${i}", {opacity:0, scale:.4}, {opacity:1, scale:1, duration:.3, ease:"back.out(2)"}, ${ln.checkAt});`);
    sfx.push({ t: ln.checkAt, kind: "ding" });
  }
});

// outro: board clears, wordmark lands where the work used to be
const o = sb.outro;
if (o) {
  js.push(`tl.to(${JSON.stringify(lineIds.join(","))}, {opacity:0, y:-20, duration:.4, stagger:.04, ease:"power2.in"}, ${o.at});`);
  html.push(
    `<div class="outro" id="outro"><div class="wm" id="wm">${esc(o.wordmark)}</div><div class="tag" id="tag">// ${esc(o.tagline)}</div></div>`
  );
  js.push(`tl.fromTo("#wm", {opacity:0, y:30}, {opacity:1, y:0, duration:.5, ease:"power3.out"}, ${o.at + 0.7});`);
  js.push(`tl.fromTo("#tag", {opacity:0}, {opacity:1, duration:.4}, ${o.at + 1.2});`);
  sfx.push({ t: o.at + 0.7, kind: "ding" });
}

// tutor sprite swaps: one visible pose at a time, set instantly (seek-safe)
const poses = ["closed", "mid", "open", "blink"];
const keys = [...mouthKeys];
blinkTimes.forEach((t) => keys.push([t, "blink"], [t + 0.1, "closed"]));
keys.sort((a, b) => a[0] - b[0]);
const poseSet = (pose, t) =>
  poses.map((p) => `tl.set("#pose-${p}", {opacity:${p === pose ? 1 : 0}}, ${t.toFixed(3)});`).join("");
js.push(poseSet("closed", 0));
keys.forEach(([t, p]) => js.push(poseSet(p, t)));

// ---------- 4. timecode odometer (pure transforms, stepped) ----------
const secs = Math.ceil(DUR);
const frameStrip = Array.from({ length: FPS }, (_, i) => `<i>${f2(i)}</i>`).join("");
const secStrip = Array.from({ length: secs + 1 }, (_, i) => `<i>${f2(i)}</i>`).join("");
js.push(`tl.to("#tc-f", {y:"-${FPS}em", duration:1, ease:"steps(${FPS})", repeat:${secs - 1}}, 0);`);
js.push(`tl.to("#tc-s", {y:"-${secs}em", duration:${secs}, ease:"steps(${secs})"}, 0);`);

// ---------- 5. ambient motion so no frame is ever frozen ----------
js.push(`tl.fromTo("#stage", {scale:1}, {scale:1.03, duration:${DUR}, ease:"none"}, 0);`);
js.push(`tl.fromTo("#tutor", {y:0}, {y:-8, duration:1.6, ease:"sine.inOut", yoyo:true, repeat:${Math.floor(DUR / 1.6)}, snap:{y:4}}, 0);`);
js.push(`tl.fromTo("#tutor-in", {x:40, opacity:0}, {x:0, opacity:1, duration:.5, ease:"power3.out", snap:{x:4}}, 0);`);

const page = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="assets/gsap.min.js"></script>
<style>
@font-face{font-family:"Plex Mono";src:url(assets/fonts/plex-mono-400.woff2) format("woff2");font-weight:400}
@font-face{font-family:"Plex Mono";src:url(assets/fonts/plex-mono-500.woff2) format("woff2");font-weight:500}
:root{--ink:#111;--dim:#b9b9b9;--label:#a3a3a3;--paper:#fff}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--paper)}
#root{position:relative;width:1920px;height:1080px;font-family:"Plex Mono",ui-monospace,monospace;color:var(--ink)}
#stage{position:absolute;inset:0;background:var(--paper);transform-origin:62% 55%}
.clip{position:absolute}
.hdr-l{top:56px;left:64px;font-size:20px;color:var(--label);letter-spacing:.02em}
.hdr-r{position:absolute;top:56px;right:64px;font-size:20px;color:var(--label);display:flex;gap:28px;letter-spacing:.04em}
.hdr-r,.tc{line-height:1em;align-items:flex-start}.tc{display:flex}.tc .win{height:1em;overflow:hidden;display:inline-block}
.tc .strip{display:flex;flex-direction:column}.tc i{font-style:normal;height:1em;line-height:1em}
.note{top:280px;left:150px;font-size:24px;color:var(--label)}
.line{position:absolute;left:${BOARD.x}px;font-size:${BOARD.size}px;font-weight:500;letter-spacing:-.01em;white-space:nowrap;color:var(--ink)}
.tok{display:inline-block;position:relative}
.mk{padding:0 .12em;margin:0 -.12em;border-radius:6px}
.line{z-index:1}
/* The answer box is a real fill behind the text, not a blend: a blend depends on
   which ancestors hold a transform, so it changed with seek order (found by check.mjs). */
.box{position:absolute;left:-.3em;right:-.3em;top:-.1em;bottom:-.08em;background:var(--ink);z-index:-1;transform-origin:left center;border-radius:8px}
.check{display:inline-block;margin-left:.5em;font-weight:500}
#tutor-in{position:absolute;inset:0}
#tutor{position:absolute;left:${TUTOR.x}px;top:${TUTOR.y}px;width:${TUTOR.w}px;height:${TUTOR.h}px;image-rendering:pixelated}
#tutor img{position:absolute;inset:0;width:${TUTOR.w}px;height:${TUTOR.h}px;image-rendering:pixelated}
.bubble{right:${1920 - BUBBLE.right}px;top:${BUBBLE.top}px;background:#fff;border:2px solid var(--ink);border-radius:34px;padding:18px 32px;font-size:30px;white-space:nowrap;transform-origin:100% 60%;z-index:3}
.bubble .w{display:inline-block}
.bubble .tail{position:absolute;right:-34px;top:26px}
.outro{position:absolute;left:150px;top:440px;z-index:2}
.wm{font-size:120px;font-weight:500;letter-spacing:-.04em}
.tag{margin-top:18px;font-size:28px;color:var(--label)}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080" data-fps="${FPS}">
  <div id="stage">
    <div id="tutor-in"><div id="tutor">${poses.map((p) => `<img id="pose-${p}" src="assets/tutor-${p}.png" alt="">`).join("")}</div></div>
    ${html.join("\n    ")}
  </div>
  <div class="hdr-r"><span>${esc(sb.brand)}</span><span class="tc">00:00:<span class="win"><span class="strip" id="tc-s">${secStrip}</span></span>:<span class="win"><span class="strip" id="tc-f">${frameStrip}</span></span></span></div>
${voiceClips.map((v, i) => `<audio id="vo${i}" class="clip" src="${esc(v.src)}" data-start="${v.at}" data-duration="${v.duration}" data-track-index="${10 + i}" data-volume="1"></audio>`).join("\n  ")}
  <audio id="sfx" class="clip" src="assets/sfx.wav" data-start="0" data-duration="${DUR}" data-track-index="9" data-volume="${voiceClips.length ? 0.35 : 0.8}"></audio>
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
${js.join("\n")}
tl.set({}, {}, ${DUR});
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
mkdirSync(join(outDir, "assets"), { recursive: true });
writeFileSync(join(outDir, "index.html"), page);

// ---------- 6. synthesize the sound bed (deterministic, license-free) ----------
const SR = 44100;
const buf = new Float32Array(Math.ceil(SR * DUR));
const add = (t0, len, fn) => {
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; i < len * SR && s0 + i < buf.length; i++) buf[s0 + i] += fn(i / SR);
};
let seed = 1;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
for (const e of sfx) {
  if (e.kind === "blip") {
    const f = 520 + e.p * 38;
    add(e.t, 0.05, (t) => 0.10 * Math.sign(Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 60));
  } else if (e.kind === "tick") {
    add(e.t, 0.03, (t) => 0.22 * noise() * Math.exp(-t * 260));
  } else if (e.kind === "pop") {
    add(e.t, 0.09, (t) => 0.28 * Math.sin(2 * Math.PI * (300 + 900 * t) * t) * Math.exp(-t * 40));
  } else if (e.kind === "thock") {
    add(e.t, 0.12, (t) => 0.35 * Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 35));
  } else if (e.kind === "ding") {
    add(e.t, 0.9, (t) => 0.16 * (Math.sin(2 * Math.PI * 1318.5 * t) + 0.5 * Math.sin(2 * Math.PI * 1975.5 * t)) * Math.exp(-t * 5));
  }
}
// soft 100 BPM pulse under everything
for (let b = 0; b * 0.6 < DUR - 0.6; b++) add(b * 0.6, 0.18, (t) => 0.07 * Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 18));
const pcm = Buffer.alloc(44 + buf.length * 2);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + buf.length * 2, 4); pcm.write("WAVE", 8);
pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
pcm.write("data", 36); pcm.writeUInt32LE(buf.length * 2, 40);
for (let i = 0; i < buf.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(buf[i]))) * 32000), 44 + i * 2);
writeFileSync(join(outDir, "assets", "sfx.wav"), pcm);
console.log(`✓ wrote ${join(outDir, "index.html")} and assets/sfx.wav (${sfx.length} sound events)`);
