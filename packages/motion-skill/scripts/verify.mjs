// Verify the delivered file, not the page: duration, size, fps, audio loudness,
// black or frozen stretches, and a frame grid pulled from the MP4 itself.
//
//   node scripts/verify.mjs <video.mp4> [--expect-duration 22] [--target-lufs -16]

import { spawnSync } from "node:child_process";
import { resolve, dirname, basename } from "node:path";

const argv = process.argv.slice(2);
const file = resolve(argv[0] || "renders/video.mp4");
const opt = (k, d) => (argv.includes(`--${k}`) ? Number(argv[argv.indexOf(`--${k}`) + 1]) : d);
const target = opt("target-lufs", -16);
const run = (args) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 26 }).stderr;
const probe = JSON.parse(spawnSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }).stdout || "{}");
const v = probe.streams?.find((s) => s.codec_type === "video");
const a = probe.streams?.find((s) => s.codec_type === "audio");
const dur = Number(probe.format?.duration || 0);
const issues = [];
const say = (ok, msg) => (console.log(`  ${ok ? "✓" : "✗"} ${msg}`), ok || issues.push(msg));
console.log(`verify ${file}`);
if (!v) process.exit(console.log("  ✗ no video stream"), 1);
say(true, `${v.width}×${v.height} · ${v.codec_name} ${v.pix_fmt} · ${eval(v.r_frame_rate).toFixed(2)} fps · ${dur.toFixed(2)} s · ${(probe.format.size / 1e6).toFixed(1)} MB`);
const exp = opt("expect-duration", null);
if (exp) say(Math.abs(dur - exp) < 0.1, `duration ${dur.toFixed(2)} s vs expected ${exp} s`);
say(v.pix_fmt === "yuv420p", "yuv420p (plays everywhere)");
if (a) {
  const ln = run(["-i", file, "-af", "loudnorm=print_format=json", "-f", "null", "-"]);
  const j = JSON.parse(ln.slice(ln.lastIndexOf("{")));
  const I = Number(j.input_i), TP = Number(j.input_tp);
  say(Math.abs(I - target) <= 3, `loudness ${I} LUFS (target ${target} ±3; social -14, lessons -16)`);
  say(TP <= -1, `true peak ${TP} dBTP (≤ -1)`);
  if (I > target + 3 || TP > -1) console.log(`    fix: ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=${target}:TP=-1.5:LRA=11 out.mp4`);
} else console.log("  · no audio stream (silent video)");
const bd = run(["-i", file, "-vf", "blackdetect=d=0.5:pix_th=0.08", "-an", "-f", "null", "-"]);
const blacks = [...bd.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => `${m[1]}–${m[2]} s`);
say(!blacks.length, blacks.length ? `black stretches: ${blacks.join(", ")}` : "no black stretches ≥ 0.5 s");
const fr = run(["-i", file, "-vf", "freezedetect=n=0.0005:d=2.5", "-an", "-f", "null", "-"]);
const frozen = [...fr.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_end: ([\d.]+)/g)].map((m) => `${(+m[1]).toFixed(1)}–${(+m[2]).toFixed(1)} s`);
say(!frozen.length, frozen.length ? `frozen stretches ≥ 2.5 s: ${frozen.join(", ")}` : "no frozen stretch ≥ 2.5 s");
const grid = resolve(dirname(file), basename(file).replace(/\.\w+$/, "") + "-grid.jpg");
const n = Math.max(1, Math.round((dur * eval(v.r_frame_rate)) / 12));
run(["-y", "-i", file, "-vf", `select='not(mod(n\\,${n}))',scale=480:-2,tile=4x3`, "-frames:v", "1", "-update", "1", grid]);
console.log(`  · frame grid from the MP4: ${grid} (compare it with the contact sheet)`);
process.exit(issues.length ? 1 : 0);
