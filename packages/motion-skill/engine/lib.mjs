// Shared helpers for FinalStudio scene templates.
// Everything here runs at build time. The page only replays a paused GSAP
// timeline, so every frame is a pure function of time (see
// motion-skill/references/determinism.md).

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// esc + chemistry/maths shorthand: CO_2 -> CO<sub>2</sub>, x^2 -> x<sup>2</sup>
export const rich = (s) => esc(s).replace(/_(\d+)/g, "<sub>$1</sub>").replace(/\^(\d+)/g, "<sup>$1</sup>");

export const r3 = (n) => Number(n.toFixed(3));

// Seeded PRNG (mulberry32). Randomness lives here, never in the page.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Vendored OFL fonts in engine/assets/fonts. Templates ask for families by key.
export const FONTS = {
  inter: [["Inter", 400, "inter-latin-400-normal"], ["Inter", 700, "inter-latin-700-normal"], ["Inter", 900, "inter-latin-900-normal"]],
  serif: [["Instrument Serif", 400, "instrument-serif-latin-400-normal"], ["Instrument Serif", 400, "instrument-serif-latin-400-italic", "italic"]],
  hand: [["Caveat", 500, "caveat-latin-500-normal"], ["Caveat", 700, "caveat-latin-700-normal"]],
  code: [["JetBrains Mono", 400, "jetbrains-mono-latin-400-normal"], ["JetBrains Mono", 700, "jetbrains-mono-latin-700-normal"]],
  pixel: [["Press Start 2P", 400, "press-start-2p-latin-400-normal"]],
  condensed: [["Anton", 400, "anton-latin-400-normal"]],
  mono: [["Plex Mono", 400, "ibm-plex-mono-latin-400-normal"], ["Plex Mono", 500, "ibm-plex-mono-latin-500-normal"]],
};

export function fontFaces(keys) {
  const files = new Set();
  const css = keys
    .flatMap((k) => FONTS[k])
    .map(([fam, w, file, style = "normal"]) => {
      files.add(file);
      return `@font-face{font-family:"${fam}";src:url(assets/fonts/${file}.woff2) format("woff2");font-weight:${w};font-style:${style}}`;
    })
    .join("\n");
  return { css, files: [...files] };
}

// Word-by-word markup. `*word*` marks an accent word (template decides the look).
export function words(text, idPrefix, cls = "w") {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w, k) => {
      const accent = /^\*.*\*[.,:;!?]?$/.test(w);
      const clean = w.replace(/\*/g, "");
      return { id: `${idPrefix}_${k}`, html: `<span class="${cls}${accent ? " acc" : ""}" id="${idPrefix}_${k}">${rich(clean)}</span>`, text: clean, accent };
    });
}

// Odometer digits: each digit is a vertical strip that rolls to its final value.
// Pure transforms, no text rewriting, so any frame can be seeked.
export function odometer(id, value, { turns = 2, lineHeight } = {}) {
  const s = String(value);
  let html = `<span class="odo" id="${id}">`;
  const tweens = [];
  let d = 0;
  for (const ch of s) {
    if (!/\d/.test(ch)) {
      html += `<span class="odo-sep">${esc(ch)}</span>`;
      continue;
    }
    const digit = Number(ch);
    const steps = turns * 10 + digit; // lands on the final digit after `turns` spins
    const strip = Array.from({ length: steps + 1 }, (_, i) => `<i>${i % 10}</i>`).join("");
    html += `<span class="odo-win"><span class="odo-strip" id="${id}_d${d}">${strip}</span></span>`;
    tweens.push({ sel: `#${id}_d${d}`, steps, order: d });
    d++;
  }
  html += `</span>`;
  // later digits (right side) spin longer, like a real counter
  const js = (at, dur) =>
    tweens
      .map(
        (t) =>
          `tl.fromTo("${t.sel}", {y:0}, {y:${-t.steps * lineHeight}, duration:${r3(dur * (0.7 + 0.3 * (t.order / Math.max(1, tweens.length - 1))))}, ease:"power3.out"}, ${r3(at)});`
      )
      .join("\n");
  return { html, js };
}

export const odometerCss = (lh) =>
  `.odo{display:inline-flex;align-items:flex-start;line-height:${lh}px;height:${lh}px}` +
  `.odo-win{display:inline-block;height:${lh}px;overflow:hidden}` +
  `.odo-strip{display:flex;flex-direction:column}.odo-strip i{font-style:normal;height:${lh}px;line-height:${lh}px;display:block;text-align:center}`;

// ---------------- sound: deterministic, synthesized, license-free ----------------
export function synthWav(events, duration, { bpm = 0, bed = 0.06, seed = 7 } = {}) {
  const SR = 44100;
  const buf = new Float32Array(Math.ceil(SR * duration));
  const add = (t0, len, fn) => {
    const s0 = Math.floor(t0 * SR);
    for (let i = 0; i < len * SR && s0 + i < buf.length; i++) if (s0 + i >= 0) buf[s0 + i] += fn(i / SR);
  };
  const rnd = rng(seed);
  const noise = () => rnd() * 2 - 1;
  const K = {
    blip: (e) => add(e.t, 0.05, (t) => 0.1 * Math.sign(Math.sin(2 * Math.PI * (520 + (e.p || 0) * 38) * t)) * Math.exp(-t * 60)),
    tick: (e) => add(e.t, 0.03, (t) => 0.2 * noise() * Math.exp(-t * 260)),
    key: (e) => add(e.t, 0.025, (t) => 0.16 * noise() * Math.exp(-t * 320) + 0.05 * Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 400)),
    click: (e) => add(e.t, 0.04, (t) => 0.35 * Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 180) + 0.1 * noise() * Math.exp(-t * 400)),
    pop: (e) => add(e.t, 0.09, (t) => 0.26 * Math.sin(2 * Math.PI * (300 + 900 * t) * t) * Math.exp(-t * 40)),
    thock: (e) => add(e.t, 0.12, (t) => 0.34 * Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 35)),
    kick: (e) => add(e.t, 0.25, (t) => 0.55 * Math.sin(2 * Math.PI * (48 + 120 * Math.exp(-t * 30)) * t) * Math.exp(-t * 12)),
    snare: (e) => add(e.t, 0.18, (t) => 0.22 * noise() * Math.exp(-t * 22) + 0.12 * Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30)),
    whoosh: (e) => add(e.t, 0.35, (t) => 0.16 * noise() * Math.sin(Math.PI * Math.min(1, t / 0.35))),
    ding: (e) => add(e.t, 0.9, (t) => 0.15 * (Math.sin(2 * Math.PI * 1318.5 * t) + 0.5 * Math.sin(2 * Math.PI * 1975.5 * t)) * Math.exp(-t * 5)),
    coin: (e) => add(e.t, 0.18, (t) => 0.1 * Math.sign(Math.sin(2 * Math.PI * (t < 0.06 ? 988 : 1319) * t)) * Math.exp(-t * 12)),
    jump: (e) => add(e.t, 0.14, (t) => 0.09 * Math.sign(Math.sin(2 * Math.PI * (300 + 1400 * t) * t)) * Math.exp(-t * 10)),
    pour: (e) => add(e.t, e.len || 0.8, (t) => 0.07 * noise() * (0.6 + 0.4 * Math.sin(2 * Math.PI * 9 * t)) * Math.min(1, t * 8) * Math.min(1, ((e.len || 0.8) - t) * 6)),
    scribble: (e) => add(e.t, e.len || 0.4, (t) => 0.05 * noise() * (0.5 + 0.5 * Math.abs(Math.sin(2 * Math.PI * 14 * t)))),
  };
  for (const e of events) (K[e.kind] || K.tick)(e);
  if (bpm) {
    const beat = 60 / bpm;
    for (let b = 0; b * beat < duration - beat; b++) add(b * beat, 0.18, (t) => bed * Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 18));
  }
  // fade the last 0.3 s so renders never end on a click
  const fade = Math.floor(0.3 * SR);
  for (let i = 0; i < fade; i++) buf[buf.length - 1 - i] *= i / fade;
  const pcm = Buffer.alloc(44 + buf.length * 2);
  pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + buf.length * 2, 4); pcm.write("WAVE", 8);
  pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36); pcm.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) pcm.writeInt16LE(Math.round(Math.tanh(buf[i]) * 32000), 44 + i * 2);
  return pcm;
}

// Facts gate: templates call this so a wrong number stops the build.
export function assertFact(cond, msg) {
  if (!cond) {
    console.error(`✗ fact check failed: ${msg}`);
    process.exit(2);
  }
}

// Clip-path box for one-element morphs: the element covers the frame and the
// visible shape is an inset rectangle, so moving/resizing never touches layout
// properties and GSAP can interpolate between any two boxes.
export const inset = (b, W, H) =>
  `inset(${r3(b.y)}px ${r3(W - b.x - b.w)}px ${r3(H - b.y - b.h)}px ${r3(b.x)}px round ${r3(b.r ?? 0)}px)`;
