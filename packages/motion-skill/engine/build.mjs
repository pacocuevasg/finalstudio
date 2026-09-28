// spec.json -> composition project (index.html + assets/), ready for
// scripts/check.mjs, scripts/sheet.mjs and scripts/render.mjs. The output is
// also a valid HyperFrames project (same data-* contract), so `npx hyperframes`
// works on it when that CLI is available.
//
//   node engine/build.mjs <spec.json> <project-dir> [--timing timing.json]
//
// spec.template picks the look:
//   halftone-tutor  -> engine/solve-step/build.mjs (FinalStudio default, worked exercises)
//   anything else   -> engine/styles/<template>.mjs, each exports build(spec, ctx)
//
// Timing: any "at"-like value written as "@anchor" or "@anchor+0.4" is replaced
// with the time of that anchor from timing.json (scripts/timing.mjs). A spec
// "voice" block ({ "src": "voice.wav", "volume": 1 }) or timing.json "audio"
// adds the narration track and ducks the synthesized sound bed under it.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fontFaces, synthWav, r3 } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const ti = argv.indexOf("--timing");
const timingPath = ti === -1 ? null : argv.splice(ti, 2)[1];
const [specPath, outDirArg] = argv;
if (!specPath || !outDirArg) {
  console.error("usage: node engine/build.mjs <spec.json> <project-dir> [--timing timing.json]");
  process.exit(1);
}
const outDir = resolve(outDirArg);
const specDir = dirname(resolve(specPath));
let spec = JSON.parse(readFileSync(specPath, "utf8"));

// ---------- 1. resolve @anchors from timing.json ----------
const timing = timingPath ? JSON.parse(readFileSync(timingPath, "utf8")) : null;
if (timing) {
  const LEAD = 2 / (spec.fps || 30); // picture leads the word by two frames
  const missing = new Set();
  const walk = (v) => {
    if (typeof v === "string" && /^@[\w-]+([+-][\d.]+)?$/.test(v)) {
      const [, name, off] = v.match(/^@([\w-]+)([+-][\d.]+)?$/);
      if (!(name in timing.anchors)) return missing.add(name), v;
      return r3(Math.max(0, timing.anchors[name] - LEAD + Number(off || 0)));
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  spec = walk(spec);
  if (missing.size) {
    console.error(`✗ anchors not found in ${timingPath}: ${[...missing].join(", ")}`);
    process.exit(2);
  }
  if (!spec.duration || spec.duration === "auto") spec.duration = r3(timing.duration + (spec.tail ?? 1.5));
  if (!spec.voice && timing.audio) spec.voice = { src: resolve(dirname(resolve(timingPath)), timing.audio) };
}
const voice = spec.voice ? { ...spec.voice, src: resolve(specDir, spec.voice.src) } : null;
if (voice && !existsSync(voice.src)) {
  console.error(`✗ voice file not found: ${voice.src}`);
  process.exit(2);
}

mkdirSync(join(outDir, "assets", "fonts"), { recursive: true });
copyFileSync(join(HERE, "assets", "gsap.min.js"), join(outDir, "assets", "gsap.min.js"));

// Voice track + ducked bed, shared by both builders.
function addVoice(html, dur) {
  if (!voice) return html;
  const name = `voice${extname(voice.src)}`;
  copyFileSync(voice.src, join(outDir, "assets", name));
  const bedVol = spec.bedUnderVoice ?? 0.35;
  return html
    .replace(/(<audio id="sfx"[^>]*data-volume=")[\d.]+"/, `$1${bedVol}"`)
    .replace(/(<audio id="sfx"[^>]*>\s*<\/audio>)/, `$1\n<audio id="vo" class="clip" src="assets/${name}" data-start="${voice.start ?? 0}" data-duration="${dur}" data-track-index="8" data-volume="${voice.volume ?? 1}"></audio>`);
}

// ---------- 2a. halftone tutor (solve-step) ----------
if (spec.template === "halftone-tutor" || (!spec.template && spec.board)) {
  for (const p of ["open", "mid", "closed", "blink"]) {
    const custom = spec.character ? join(resolve(specDir, spec.character), `tutor-${p}.png`) : null;
    copyFileSync(custom && existsSync(custom) ? custom : join(HERE, "assets", "tutor", `tutor-${p}.png`), join(outDir, "assets", `tutor-${p}.png`));
  }
  for (const w of [400, 500]) copyFileSync(join(HERE, "assets", "fonts", `ibm-plex-mono-latin-${w}-normal.woff2`), join(outDir, "assets", "fonts", `plex-mono-${w}.woff2`));
  const resolved = join(tmpdir(), `motion-spec-${process.pid}.json`);
  writeFileSync(resolved, JSON.stringify(spec, null, 2));
  const r = spawnSync(process.execPath, [join(HERE, "solve-step", "build.mjs"), resolved, outDir], { stdio: "inherit" });
  rmSync(resolved, { force: true });
  if (r.status !== 0) process.exit(r.status);
  const idx = join(outDir, "index.html");
  writeFileSync(idx, addVoice(readFileSync(idx, "utf8"), spec.duration));
  const times = [...(spec.scenes || []).map((s, i, a) => (s.start + (a[i + 1]?.start ?? spec.duration)) / 2)];
  finish(times);
} else {
  // ---------- 2b. style modules ----------
  const FPS = spec.fps || 30;
  const stylePath = join(HERE, "styles", `${spec.template}.mjs`);
  if (!existsSync(stylePath)) {
    console.error(`✗ unknown template "${spec.template}". Available: halftone-tutor, ${listStyles().join(", ")}`);
    process.exit(1);
  }
  const style = await import(stylePath);
  const ctx = { W: spec.width || 1920, H: spec.height || 1080, FPS, css: [], html: [], js: [], sfx: [], fonts: new Set(), bpm: 0, bed: 0.05, duration: spec.duration };
  style.build(spec, ctx);
  const { W, H } = ctx;
  const DUR = ctx.duration;
  if (!DUR) throw new Error("style did not set ctx.duration");
  const ff = fontFaces([...ctx.fonts]);
  let page = `<!doctype html>
<html lang="${spec.lang || "es"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<!-- motion-skill template: ${spec.template} -->
<script src="assets/gsap.min.js"></script>
<style>
${ff.css}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.abs{position:absolute}
${ctx.css.join("\n")}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
${ctx.html.join("\n")}
<audio id="sfx" class="clip" src="assets/sfx.wav" data-start="0" data-duration="${DUR}" data-track-index="9" data-volume="0.8"></audio>
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
${ctx.js.join("\n")}
tl.set({}, {}, ${r3(DUR)});
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
  page = addVoice(page, DUR);
  writeFileSync(join(outDir, "index.html"), page);
  for (const f of ff.files) copyFileSync(join(HERE, "assets", "fonts", `${f}.woff2`), join(outDir, "assets", "fonts", `${f}.woff2`));
  writeFileSync(join(outDir, "assets", "sfx.wav"), synthWav(ctx.sfx, DUR, { bpm: ctx.bpm, bed: ctx.bed }));
  console.log(`✓ ${spec.template}: ${join(outDir, "index.html")} · ${DUR}s · ${ctx.sfx.length} sound events${voice ? " · voice track" : ""}`);
  finish(ctx.snapshots || []);
}

function finish(times) {
  writeFileSync(
    join(outDir, "hyperframes.json"),
    JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { assets: "assets" }, media: { autoProxy: true } }, null, 2)
  );
  writeFileSync(join(outDir, "meta.json"), JSON.stringify({ id: spec.id || spec.template, name: spec.id || spec.template, template: spec.template || "halftone-tutor", snapshots: times.map(r3) }, null, 2));
  if (times.length) console.log(`  sheet times: ${times.map(r3).join(",")}`);
}

function listStyles() {
  return readdirSync(join(HERE, "styles")).filter((f) => f.endsWith(".mjs")).map((f) => f.slice(0, -4));
}
