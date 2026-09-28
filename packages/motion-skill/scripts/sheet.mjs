// Contact sheet: capture frames at given times and tile them into one image,
// labeled with timecodes. Needs only Chrome (the tiling happens in the page).
//
//   node scripts/sheet.mjs <project-dir> [--at 1.2,4,7.5 | --every 2 | --scenes] [--cols 4] [--width 480] [-o snapshots/sheet.jpg] [--frames]
//
// --scenes (default) reads the times the builder wrote into meta.json.
// --frames also writes each full-size frame as snapshots/frame-<t>.png.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { launch, serve, openComposition, seek, tc } from "./lib/chrome.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);
const project = resolve(argv.find((a, i) => !a.startsWith("-") && !(argv[i - 1] || "").startsWith("-")) || ".");
const out = resolve(project, argv.includes("-o") ? argv[argv.indexOf("-o") + 1] : "snapshots/sheet.jpg");
const cols = Number(opt("cols", 4));
const cw = Number(opt("width", 480));

const srv = await serve(project);
const browser = await launch();
try {
  const { page, info } = await openComposition(browser, project, srv.url);
  const D = info.duration;
  let times;
  if (opt("at")) times = opt("at").split(",").map(Number);
  else if (opt("every")) times = Array.from({ length: Math.floor(D / Number(opt("every"))) }, (_, k) => +((k + 0.5) * Number(opt("every"))).toFixed(3));
  else {
    const meta = existsSync(join(project, "meta.json")) ? JSON.parse(readFileSync(join(project, "meta.json"), "utf8")) : {};
    times = meta.snapshots?.length ? meta.snapshots : Array.from({ length: 8 }, (_, k) => +(((k + 0.5) * D) / 8).toFixed(3));
  }
  const imgs = [];
  mkdirSync(dirname(out), { recursive: true });
  for (const t of times) {
    await seek(page, t);
    const png = await page.shot();
    imgs.push(png.toString("base64"));
    if (argv.includes("--frames")) writeFileSync(join(dirname(out), `frame-${t.toFixed(2)}s.png`), png);
  }
  await page.close();
  const ch = Math.round((cw * info.height) / info.width);
  const rows = Math.ceil(imgs.length / cols);
  const W = cols * cw + (cols + 1) * 8, H = rows * (ch + 26) + 8;
  const tile = await browser.newPage({ width: W, height: H });
  await tile.goto("about:blank");
  const jpg = await tile.eval(`(async () => {
    const imgs = ${JSON.stringify(imgs)}, labels = ${JSON.stringify(times.map((t) => tc(t, info.fps)))};
    const c = new OffscreenCanvas(${W}, ${H}), x = c.getContext('2d');
    x.fillStyle = '#1b1b1b'; x.fillRect(0, 0, ${W}, ${H});
    for (let k = 0; k < imgs.length; k++) {
      const i = new Image(); i.src = 'data:image/png;base64,' + imgs[k]; await i.decode();
      const cx = 8 + (k % ${cols}) * (${cw} + 8), cy = 8 + Math.floor(k / ${cols}) * (${ch} + 26);
      x.drawImage(i, cx, cy, ${cw}, ${ch});
      x.fillStyle = '#ddd'; x.font = '14px monospace'; x.fillText(labels[k] + '  ·  ' + (k + 1), cx + 2, cy + ${ch} + 17);
    }
    const blob = await c.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
    const u = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (const b of u) s += String.fromCharCode(b); return btoa(s);
  })()`);
  writeFileSync(out, Buffer.from(jpg, "base64"));
  console.log(`✓ ${out} · ${times.length} frames at ${times.join(", ")} s`);
} finally {
  await browser.close();
  srv.close();
}
