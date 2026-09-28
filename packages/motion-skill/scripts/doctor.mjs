// What this machine has, and what to do about what it lacks. Installs nothing.
//
//   node scripts/doctor.mjs [--json]

import { spawnSync } from "node:child_process";
import { findChrome, launch } from "./lib/chrome.mjs";

const r = { node: process.versions.node, chrome: findChrome(), ffmpeg: null, ffprobe: null, launch: false, optional: {} };
const ver = (cmd) => { const x = spawnSync(cmd, ["-version"], { encoding: "utf8" }); return x.status === 0 ? x.stdout.split("\n")[0] : null; };
r.ffmpeg = ver("ffmpeg");
r.ffprobe = ver("ffprobe");
if (r.chrome) try { const b = await launch(); await b.close(); r.launch = true; } catch (e) { r.launchError = e.message.slice(0, 300); }
const has = (cmd, args = ["--version"]) => spawnSync(cmd, args, { encoding: "utf8" }).status === 0;
r.optional.hyperframes = has("npx", ["--no-install", "hyperframes", "--version"]);
r.optional.python3 = has("python3");
if (process.argv.includes("--json")) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
const ok = (b) => (b ? "✓" : "✗");
console.log(`${ok(+r.node.split(".")[0] >= 18)} node ${r.node} (18+ needed)`);
console.log(`${ok(r.chrome && r.launch)} chrome ${r.chrome || "not found"}${r.chrome && !r.launch ? " (found but did not start: " + r.launchError + ")" : ""}`);
console.log(`${ok(r.ffmpeg)} ffmpeg ${r.ffmpeg || "not found"}`);
console.log(`${ok(r.ffprobe)} ffprobe ${r.ffprobe ? "ok" : "not found"}`);
console.log(`· optional: hyperframes CLI ${r.optional.hyperframes ? "available" : "absent (not needed)"}`);
if (!r.chrome) console.log(`\nChrome: install Google Chrome or Chromium, or point MOTION_CHROME at any Chromium binary\n  (Playwright/Puppeteer downloads work: ~/.cache/ms-playwright/chromium_headless_shell-*/…/headless_shell).`);
if (!r.ffmpeg) console.log(`\nFFmpeg: macOS 'brew install ffmpeg' · Debian/Ubuntu 'sudo apt-get install -y ffmpeg' · Windows 'winget install ffmpeg'.\n  Without it you can still build, check and make contact sheets; only render/verify need it.`);
process.exit(r.chrome && r.launch ? 0 : 1);
