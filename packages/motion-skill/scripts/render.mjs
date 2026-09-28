// Render a composition to MP4 with nothing but Chrome and FFmpeg.
//
//   node scripts/render.mjs <project-dir> [-o renders/video.mp4] [--quality draft|standard|high]
//                           [--workers 4] [--from 0] [--to <s>] [--fps 30] [--gif] [--lufs -16 | --no-loudnorm]
//
// Every frame is seeked on the paused timeline and captured, so the result is
// frame-exact and independent of machine speed. Audio: every <audio> element
// with data-start / data-duration / data-volume / data-media-start is mixed by
// FFmpeg at its place on the timeline.

import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { launch, serve, openComposition, seek, readSize } from "./lib/chrome.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i === -1 ? d : argv[i + 1];
};
const flag = (k) => argv.includes(`--${k}`);
const project = resolve(argv.find((a, i) => !a.startsWith("-") && !(argv[i - 1] || "").startsWith("-")) || ".");
const outFile = resolve(project, opt("o", argv.includes("-o") ? argv[argv.indexOf("-o") + 1] : "renders/video.mp4"));
const quality = opt("quality", "standard");
const workers = Math.max(1, Number(opt("workers", 4)));
const CRF = { draft: 28, standard: 20, high: 16 }[quality] ?? 20;
const SCALE = quality === "draft" ? 0.5 : 1;

const ff = spawnSync("ffmpeg", ["-version"]);
if (ff.status !== 0) {
  console.error("✗ ffmpeg not found. Install it (see scripts/doctor.mjs) and run again.");
  process.exit(1);
}

const size = await readSize(project);
const fps = Number(opt("fps", size.fps));
const t0 = Number(opt("from", 0));
const t1 = Number(opt("to", size.duration));
const N = Math.round((t1 - t0) * fps);
const tmp = mkdtempSync(join(tmpdir(), "motion-frames-"));
const started = Date.now();

const srv = await serve(project);
const browser = await launch();
try {
  const chunks = Array.from({ length: workers }, (_, w) => [Math.floor((w * N) / workers), Math.floor(((w + 1) * N) / workers)]);
  let done = 0;
  await Promise.all(
    chunks.map(async ([a, b]) => {
      if (a >= b) return;
      const { page, info } = await openComposition(browser, project, srv.url);
      if (info.fontsFailed.length) console.warn(`! fonts failed to load: ${info.fontsFailed.join(", ")}`);
      for (let f = a; f < b; f++) {
        await seek(page, t0 + f / fps);
        writeFileSync(join(tmp, `f${String(f).padStart(6, "0")}.jpg`), await page.shot({ format: "jpeg", quality: 95 }));
        done++;
        if (done % 60 === 0) process.stdout.write(`\r  frames ${done}/${N}`);
      }
      await page.close();
    })
  );
  process.stdout.write(`\r  frames ${N}/${N}\n`);
} finally {
  await browser.close();
  srv.close();
}

// ---------- audio: collect <audio> clips from the page source ----------
const html = readFileSync(join(project, "index.html"), "utf8");
const clips = [...html.matchAll(/<audio\b[^>]*>/g)].map(([tag]) => {
  const a = (k) => (tag.match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
  return { src: a("src"), start: Number(a("data-start") || 0), dur: Number(a("data-duration") || 0), vol: Number(a("data-volume") ?? 1), mstart: Number(a("data-media-start") || 0) };
}).filter((c) => c.src && existsSync(join(project, c.src)));

mkdirSync(dirname(outFile), { recursive: true });
const args = ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(tmp, "f%06d.jpg")];
let filter = [];
clips.forEach((c, i) => {
  const from = Math.max(0, t0 - c.start) + c.mstart;
  const delay = Math.max(0, c.start - t0) * 1000;
  const end = c.dur ? `:end=${from + c.dur - Math.max(0, t0 - c.start)}` : "";
  filter.push(`[${i + 1}:a]atrim=start=${from}${end},asetpts=PTS-STARTPTS,volume=${c.vol},adelay=${Math.round(delay)}:all=1[a${i}]`);
});
if (clips.length) {
  // Pass 1: mix every clip to one WAV. Pass 2: measure its loudness and apply
  // one linear gain plus a true-peak-safe limiter. (Single-pass loudnorm
  // under-shoots on sparse SFX beds and can overshoot the peak ceiling.)
  const mix = join(tmp, "mix.wav");
  filter.push(`${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0:dropout_transition=0,atrim=end=${t1 - t0},aresample=48000[aout]`);
  const m = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...clips.flatMap((c) => ["-i", join(project, c.src)]), "-filter_complex", filter.join(";").replace(/\[(\d+):a\]/g, (_, n) => `[${n - 1}:a]`), "-map", "[aout]", "-c:a", "pcm_s16le", mix], { stdio: "inherit" });
  if (m.status !== 0) (console.error("✗ audio mix failed"), process.exit(1));
  let af = "alimiter=limit=0.89:level=disabled";
  if (!flag("no-loudnorm")) {
    // Sparse SFX beds have a huge crest factor: a plain gain either stays quiet
    // or clips. Gentle compression, then gain, then a limiter run at 4x the
    // sample rate (catches inter-sample peaks), repeated until the measured
    // loudness lands within 1 LU of the target.
    const target = Number(opt("lufs", -16));
    const chain = (g) => `acompressor=threshold=-30dB:ratio=4:attack=3:release=120,volume=${g.toFixed(2)}dB,aresample=192000,alimiter=limit=0.7:attack=1:release=50:level=disabled,aresample=48000`;
    const measure = (f) => {
      const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", mix, "-af", `${f},ebur128=peak=true`, "-f", "null", "-"], { encoding: "utf8" });
      const sum = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
      return { I: Number((sum.match(/I:\s+(-?[\d.]+|-inf)/) || [])[1]), peak: Number((sum.match(/Peak:\s+(-?[\d.]+|-inf)/) || [])[1]) };
    };
    let gain = 0, m = measure(chain(0));
    for (let i = 0; i < 5 && Number.isFinite(m.I) && Math.abs(m.I - target) > 1 && gain < 40; i++) {
      gain = Math.min(40, gain + (target - m.I));
      m = measure(chain(gain));
    }
    af = chain(gain);
    console.log(`  audio ${Number.isFinite(m.I) ? m.I.toFixed(1) + " LUFS" : "silent"} (target ${target}), true peak ${Number.isFinite(m.peak) ? m.peak.toFixed(1) : "-inf"} dBTP, gain ${gain.toFixed(1)} dB`);
  }
  args.push("-i", mix, "-map", "0:v", "-map", "1:a", "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000");
}
const vf = [`scale=${Math.round((size.width * SCALE) / 2) * 2}:${Math.round((size.height * SCALE) / 2) * 2}:flags=lanczos`, "format=yuv420p"];
args.push("-vf", vf.join(","), "-c:v", "libx264", "-preset", quality === "draft" ? "veryfast" : "medium", "-crf", String(CRF), "-r", String(fps), "-t", String(t1 - t0), "-movflags", "+faststart", outFile);
const enc = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (enc.status !== 0) {
  console.error("✗ ffmpeg failed; frames kept in " + tmp);
  process.exit(1);
}
if (flag("gif")) {
  const gif = outFile.replace(/\.mp4$/, ".gif");
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", outFile, "-vf", `fps=15,scale=${Math.min(800, size.width)}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`, gif], { stdio: "inherit" });
  console.log(`✓ ${gif}`);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`✓ ${outFile} · ${N} frames · ${(t1 - t0).toFixed(2)} s · ${clips.length} audio clip(s) · ${((Date.now() - started) / 1000).toFixed(1)} s wall`);
