// The gate before any render. One command, one Chrome, no npm packages.
//
//   node scripts/check.mjs <project-dir> [--samples 16] [--at 1.2,4,7.5] [--json] [--strict] [--safe auto|none]
//
// 1. Static:   seek-safety bans (Math.random, Date, rAF, timers, CSS animation),
//              remote URLs, missing composition root or timeline registration.
// 2. Runtime:  console errors, exceptions, failed or external requests, fonts that failed.
// 3. Layout:   text leaving the canvas, text clipped by its own box, two held
//              texts overlapping, text in the platform safe zones, low contrast.
// 4. Motion:   frozen stretches (nothing moves for too long), a fully static video,
//              timeline shorter than the declared duration.
// 5. Determinism: the same frames captured in two different seek orders must be
//              pixel-identical.
// Exit code 1 on any error (with --strict, on warnings too).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { launch, serve, openComposition, seek, tc } from "./lib/chrome.mjs";

const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);
const project = resolve(argv.find((a, i) => !a.startsWith("--") && !(argv[i - 1] || "").startsWith("--")) || ".");
const asJson = argv.includes("--json");
const strict = argv.includes("--strict");
const findings = [];
const add = (severity, code, message, extra = {}) => findings.push({ severity, code, message, ...extra });

// ---------- 1. static ----------
const files = ["index.html", ...(existsSync(join(project, "compositions")) ? readdirSync(join(project, "compositions")).filter((f) => f.endsWith(".html")).map((f) => `compositions/${f}`) : [])];
for (const f of files) {
  const src = readFileSync(join(project, f), "utf8");
  const scripts = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
  const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n") + [...src.matchAll(/style="([^"]*)"/g)].map((m) => m[1]).join(";");
  const bans = [
    [/Math\.random\s*\(/, "Math.random() in the page: randomness must be seeded at build time"],
    [/\bDate\.now\s*\(|new Date\s*\(/, "wall-clock time in the page"],
    [/performance\.now\s*\(/, "performance.now() in the page"],
    [/requestAnimationFrame\s*\(/, "requestAnimationFrame loop in the page: animate on the timeline"],
    [/\bset(Timeout|Interval)\s*\(/, "timers in the page"],
    [/repeat\s*:\s*-1/, "infinite GSAP repeat: give it a finite count that fits the duration"],
    [/onUpdate\s*:/, "onUpdate drawing: only allowed when it is a pure function of the tween progress", "warning"],
  ];
  for (const [re, msg, sev = "error"] of bans) if (re.test(scripts)) add(sev, "static_nondeterminism", `${f}: ${msg}`);
  if (/@keyframes|animation\s*:|animation-name\s*:|transition\s*:\s*(?!none)/.test(styles)) add("error", "static_css_animation", `${f}: CSS animation/transition runs on wall-clock time; use the timeline`);
  for (const m of src.matchAll(/(?:src|href)\s*=\s*"(https?:\/\/[^"]+)"|url\(\s*['"]?(https?:\/\/[^'")]+)/g))
    if (!/hyperframes\.heygen\.com\/schema/.test(m[1] || m[2])) add("error", "static_remote_asset", `${f}: remote asset ${m[1] || m[2]} (vendor it into assets/)`);
  if (f === "index.html") {
    if (!/data-composition-id=/.test(src)) add("error", "no_root", "index.html has no [data-composition-id] root");
    if (!/window\.__timelines/.test(src)) add("error", "no_timeline", "no timeline registered on window.__timelines");
    if (!/data-duration=/.test(src)) add("error", "no_duration", "root has no data-duration");
  }
}

// ---------- 2-5. browser ----------
const AUDIT = `((opts) => {
  const W = opts.W, H = opts.H, out = [];
  // visible = displayed, not hidden, and cumulative opacity above 0.1
  const vis = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden') return false; o *= +s.opacity; } return o > 0.1; };
  const texts = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.getElementById('root') || document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const tn = walker.currentNode; if (!tn.textContent.trim()) continue;
    let el = tn.parentElement;
    while (el.parentElement && getComputedStyle(el).display === 'inline') el = el.parentElement;
    if (!vis(tn.parentElement)) continue;
    const r = document.createRange(); r.selectNodeContents(tn); const full = r.getBoundingClientRect();
    if (full.width < 2 || full.height < 2) continue;
    const s = getComputedStyle(el);
    // visible rect = text rect cut by every overflow:hidden ancestor
    let b = { left: full.left, top: full.top, right: full.right, bottom: full.bottom }, win = null, clipper = null;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.overflow !== 'visible' || ps.overflowX !== 'visible' || ps.overflowY !== 'visible') {
        const pb = p.getBoundingClientRect();
        if (pb.height < parseFloat(s.fontSize) * 1.8) win = win || p; // odometer / line-reveal window: clipping is the design
        if (!clipper && (full.left < pb.left - 4 || full.right > pb.right + 4)) clipper = p;
        b = { left: Math.max(b.left, pb.left), top: Math.max(b.top, pb.top), right: Math.min(b.right, pb.right), bottom: Math.min(b.bottom, pb.bottom) };
      }
    }
    if (b.right - b.left < 2 || b.bottom - b.top < 2) continue; // fully masked
    b.width = b.right - b.left; b.height = b.bottom - b.top;
    // ink box: line boxes are taller than the glyphs, so tight lockups would read as overlaps
    const fs0 = parseFloat(s.fontSize), inset = Math.max(0, (full.height - 0.78 * fs0) / 2);
    const ink = { left: b.left, right: b.right, top: Math.max(b.top, full.top + inset), bottom: Math.min(b.bottom, full.bottom - inset) };
    ink.width = ink.right - ink.left; ink.height = Math.max(0, ink.bottom - ink.top);
    const shadowed = s.textShadow !== 'none' || parseFloat(s.webkitTextStrokeWidth || 0) > 0;
    let in3d = false;
    for (let p = el; p && p.id !== 'root'; p = p.parentElement) { const tf = getComputedStyle(p).transform; if (tf.startsWith('matrix3d')) { in3d = true; break; } }
    const own = getComputedStyle(tn.parentElement); // the element that actually colors this text
    texts.push({ el, b, ink, shadowed, in3d, full, win, clipper, fs: parseFloat(own.fontSize), color: own.color,
      sel: el.id ? '#' + el.id : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).join('.') : ''),
      text: tn.textContent.trim().replace(/\\s+/g, ' ').slice(0, 40),
      allowOverflow: !!el.closest('[data-layout-allow-overflow]'), allowOverlap: !!el.closest('[data-layout-allow-overlap]') });
  }
  const tol = 2;
  const tn_owner = (t) => t.el;
  const rk = (r) => [r.left, r.top, r.right, r.bottom].map(Math.round).join(',');
  for (const t of texts) {
    const b = t.b;
    if (t.in3d) continue; // text on 3D planes is art direction; judge it on the sheet
    const outside = Math.max(0, -b.left) + Math.max(0, b.right - W) + Math.max(0, -b.top) + Math.max(0, b.bottom - H);
    if (outside > tol && !t.allowOverflow) out.push({ code: 'text_off_canvas', sel: t.sel, text: t.text, px: Math.round(outside), rect: rk(t.full) });
    if (t.clipper && !t.win && !t.allowOverflow) out.push({ code: (t.clipper.id === 'root' || t.clipper === document.body) ? 'text_off_canvas' : 'text_clipped', sel: t.sel, text: t.text, px: Math.round((t.full.right - t.full.left) - b.width), rect: rk(t.full) });
    if (opts.safe === 'vertical' && (b.top < H * 0.10 || b.bottom > H * 0.80) && t.fs >= 28) out.push({ code: 'safe_zone', sel: t.sel, text: t.text });
    if (opts.safe === 'landscape' && b.bottom > H * 0.92 && t.fs >= 28) out.push({ code: 'safe_zone', sel: t.sel, text: t.text });
    // contrast against the nearest painted background
    const rgb = (c) => (c.match(/[\\d.]+/g) || []).map(Number);
    let bg = null;
    // what is actually painted under the text: first opaque box in the hit stack
    const cx = Math.min(W - 1, Math.max(0, (b.left + b.right) / 2)), cy = Math.min(H - 1, Math.max(0, (b.top + b.bottom) / 2));
    let unknown = t.shadowed;
    for (const p of document.elementsFromPoint(cx, cy)) { const ps = getComputedStyle(p);
      if (ps.backgroundImage !== 'none' && vis(p)) { unknown = true; break; }
      const c = rgb(ps.backgroundColor); if (c.length >= 3 && (c[3] ?? 1) > 0.5 && vis(p)) { bg = c; break; } }
    if (unknown) bg = null;
    else if (!bg) for (let p = t.el; p; p = p.parentElement) { const c = rgb(getComputedStyle(p).backgroundColor); if (c.length >= 3 && (c[3] ?? 1) > 0.5) { bg = c; break; } }
    const fg = rgb(t.color);
    if (bg && fg.length >= 3 && (fg[3] ?? 1) > 0.5) {
      const L = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const [a, c] = [L(fg), L(bg)].sort((x, y) => y - x); const ratio = (a + 0.05) / (c + 0.05);
      const need = t.fs >= 24 ? 3 : 4.5;
      if (ratio < need && !t.el.closest('[data-layout-allow-contrast]')) out.push({ code: 'low_contrast', sel: 'rgb(' + fg.slice(0,3) + ') on rgb(' + bg.slice(0,3) + ')', text: t.text, ratio: +ratio.toFixed(2), need });
    }
  }
  // occlusion: something opaque painted on top of held text (a bubble, a card, a shape)
  for (const t of texts) {
    if (t.in3d || t.ink.height < 9 || t.el.closest('[data-layout-allow-occlusion]')) continue;
    const P = t.ink, pts = [[.5, .5], [.15, .3], [.85, .3], [.15, .75], [.85, .75]].map(([u, v]) => [P.left + u * P.width, P.top + v * P.height]);
    let hit = 0, by = null;
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      for (const e of document.elementsFromPoint(x, y)) {
        if (e === t.el || e.contains(t.el) || t.el.contains(e) || e === tn_owner(t)) break;      // reached the text first
        const es = getComputedStyle(e);
        const c = (es.backgroundColor.match(/[\\d.]+/g) || []).map(Number);
        const opaque = (c.length >= 3 && (c[3] ?? 1) > 0.6) || e.tagName === 'IMG' || es.backgroundImage !== 'none';
        if (opaque && vis(e) && !e.closest('[data-layout-allow-occlusion]')) { hit++; by = by || e; break; }
      }
    }
    if (hit >= 2) out.push({ code: 'text_occluded', sel: t.sel, text: t.text, by: by.id ? '#' + by.id : by.tagName.toLowerCase() + (typeof by.className === 'string' && by.className ? '.' + by.className.trim().split(/\\s+/)[0] : ''), rect: rk(t.full) });
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const A = texts[i], B = texts[j];
    if (A.ink.height < 9 || B.ink.height < 9) continue; // too small to read either way
    if (A.in3d || B.in3d || (A.win && A.win === B.win) || A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el) || A.allowOverlap || B.allowOverlap) continue;
    const P = A.ink, Q = B.ink;
    const ix = Math.max(0, Math.min(P.right, Q.right) - Math.max(P.left, Q.left));
    const iy = Math.max(0, Math.min(P.bottom, Q.bottom) - Math.max(P.top, Q.top));
    const small = Math.min(P.width * P.height, Q.width * Q.height);
    // the same words stacked on themselves (stroke / shadow / fill layers) are one piece of type
    if (A.text === B.text && ix * iy > 0.6 * Math.max(P.width * P.height, Q.width * Q.height)) continue;
    if (ix > 4 && iy > 4 && ix * iy > small * 0.12) out.push({ code: 'text_overlap', sel: A.sel + ' × ' + B.sel, text: A.text + ' × ' + B.text, rect: rk(A.full) + '|' + rk(B.full) });
  }
  // motion fingerprint: transforms + opacity + visibility of every element
  let fp = '';
  for (const e of document.querySelectorAll('#root *')) { const s = getComputedStyle(e); fp += s.transform + s.opacity + s.visibility + (e.style.cssText.length) + '|'; }
  return { findings: out, fp };
})`;

const srv = await serve(project);
const browser = await launch();
let info;
try {
  const { page, info: i } = await openComposition(browser, project, srv.url);
  info = i;
  const { width: W, height: H, duration: D, fps } = info;
  const safe = opt("safe", "auto") === "none" ? "none" : H > W ? "vertical" : "landscape";
  if (info.fontsFailed.length) add("error", "font_failed", `fonts failed to load: ${[...new Set(info.fontsFailed)].join(", ")}`);
  if (info.timelineDuration + 1 / fps < D - 0.05) add("warning", "timeline_short", `timeline ends at ${info.timelineDuration.toFixed(2)} s but the composition lasts ${D} s (pin it with tl.set({}, {}, ${D}))`);

  const n = Number(opt("samples", Math.max(12, Math.ceil(D * 2))));
  const extra = opt("at", "") ? opt("at").split(",").map(Number) : [];
  const times = [...new Set([...Array.from({ length: n }, (_, k) => +(((k + 0.5) * D) / n).toFixed(3)), ...extra])].sort((a, b) => a - b);
  const held = new Map(); // code+sel -> [times]
  const fps_ = [];
  const near = (a, b) => a && b && a.split(/[,|]/).every((v, i) => Math.abs(+v - +b.split(/[,|]/)[i]) <= 2);
  for (const t of times) {
    await seek(page, t);
    const r = await page.eval(`${AUDIT}(${JSON.stringify({ W, H, safe })})`);
    fps_.push(r.fp);
    // a layout finding only counts where the text is standing still: look again 0.2 s later
    // (long enough to see through stepped, stop-motion movement)
    let later = null;
    if (r.findings.some((f) => f.rect && f.code !== "text_overlap")) {
      await seek(page, Math.min(D - 1e-3, t + 0.2));
      later = new Map((await page.eval(`${AUDIT}(${JSON.stringify({ W, H, safe })})`)).findings.map((f) => [`${f.code}|${f.sel}`, f.rect]));
    }
    for (const f of r.findings) {
      const k = f.code === "safe_zone" ? "safe_zone|all" : `${f.code}|${f.sel}`;
      const still = !f.rect || f.code === "text_overlap" || f.code === "text_occluded" || near(f.rect, later?.get(`${f.code}|${f.sel}`));
      if (!held.has(k)) held.set(k, { ...f, times: [], stillTimes: [], examples: new Set() });
      const h = held.get(k);
      if (!h.times.includes(t)) h.times.push(t);
      if (still && !h.stillTimes.includes(t)) h.stillTimes.push(t);
      h.examples.add(f.text);
    }
  }
  const step = D / n;
  for (const f of held.values()) {
    // held = seen standing still at two consecutive samples; text travelling through an edge or past another text is transient
    const idx = f.stillTimes.map((t) => times.indexOf(t)).sort((a, b) => a - b);
    const consecutive = idx.some((v, i) => i > 0 && v - idx[i - 1] === 1);
    const persistent = consecutive || extra.some((x) => f.stillTimes.includes(x));
    const sev = { text_off_canvas: "error", text_clipped: "error", text_overlap: "error", text_occluded: "error", low_contrast: "warning", safe_zone: "warning" }[f.code];
    const where = f.times.map((t) => tc(t, fps)).slice(0, 4).join(", ") + (f.times.length > 4 ? "…" : "");
    const detail = f.code === "low_contrast" ? ` (ratio ${f.ratio} < ${f.need})` : f.code === "text_occluded" ? ` (covered by ${f.by})` : f.px ? ` (${f.px}px)` : "";
    const ex = [...f.examples];
    const what = f.code === "low_contrast" || f.code === "safe_zone" ? `${f.sel}: ${ex.length} text(s) like "${ex.slice(0, 3).join('", "')}"` : `${f.sel} "${f.text}"`;
    add(persistent ? sev : "info", f.code, `${what}${detail} at ${where}`, { times: f.times });
  }
  // frozen stretches
  let run = 0, longest = 0, at = 0;
  for (let k = 1; k < fps_.length; k++) {
    if (fps_[k] === fps_[k - 1]) { run += times[k] - times[k - 1]; if (run > longest) (longest = run), (at = times[k]); } else run = 0;
  }
  if (new Set(fps_).size === 1 && D > 3) add("error", "static_video", "nothing changes across the whole timeline");
  else if (longest > Math.max(3, step * 2.5)) add("warning", "frozen_stretch", `nothing moves for ${longest.toFixed(1)} s ending near ${tc(at, fps)}: keep one element alive (breathing, cursor, push-in)`);

  // runtime
  for (const e of page.events.exceptions) add("error", "js_exception", e);
  for (const e of page.events.console) add("error", "console_error", e);
  for (const e of page.events.failed) add("error", "request_failed", e);
  for (const u of page.events.requests) if (!u.startsWith(srv.url) && !u.startsWith("data:") && !u.startsWith("about:")) add("error", "external_request", `page requested ${u}`);
  const missing = srv.requests.filter((u) => !existsSync(join(project, u === "/" ? "index.html" : u)));
  for (const u of missing) add("error", "missing_file", `page asked for ${u}, which is not in the project`);
  await page.close();

  // determinism: forward vs shuffled order in two fresh pages
  const pick = [0, 0.13, 0.37, 0.5, 0.71, 0.93].map((p) => +(p * (D - 1 / fps)).toFixed(3));
  const shots = async (order) => {
    const { page: p } = await openComposition(browser, project, srv.url);
    const h = {};
    for (const t of order) { await seek(p, t); h[t] = (await p.shot()).toString("base64"); }
    await p.close();
    return h;
  };
  const a = await shots(pick);
  const b = await shots([3, 0, 5, 1, 4, 2].map((k) => pick[k]));
  // Compare decoded pixels (1-level antialiasing noise is not a leak).
  const cmp = await browser.newPage({ width: 200, height: 200 });
  await cmp.goto("about:blank");
  const bad = [];
  for (const t of pick) {
    if (a[t] === b[t]) continue;
    const d = await cmp.eval(`(async () => {
      const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode();
        const c = new OffscreenCanvas(i.width, i.height); const x = c.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
      const [p, q] = await Promise.all([load(${JSON.stringify(a[t])}), load(${JSON.stringify(b[t])})]);
      let n = 0; for (let k = 0; k < p.length; k += 4) if (Math.abs(p[k]-q[k]) + Math.abs(p[k+1]-q[k+1]) + Math.abs(p[k+2]-q[k+2]) > 48) n++;
      return n / (p.length / 4);
    })()`);
    if (d > 0.0005) bad.push(`${tc(t, fps)} (${(d * 100).toFixed(2)}% of pixels)`);
  }
  await cmp.close();
  if (bad.length) add("error", "nondeterministic", `frames differ with seek order at ${bad.join(", ")}: state leaks between frames (a tween that records its start late, a blend that depends on an ancestor transform, drawing that accumulates)`);
} finally {
  await browser.close();
  srv.close();
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warning");
if (asJson) console.log(JSON.stringify({ ok: !errors.length && (!strict || !warnings.length), info, findings }, null, 2));
else {
  console.log(`check ${project}\n  ${info ? `${info.width}×${info.height} · ${info.fps} fps · ${info.duration} s` : ""}`);
  for (const f of findings.filter((f) => f.severity !== "info")) console.log(`  ${f.severity === "error" ? "✗" : "!"} [${f.code}] ${f.message}`);
  const infos = findings.filter((f) => f.severity === "info").length;
  console.log(`${errors.length ? "✗" : "✓"} ${errors.length} error(s), ${warnings.length} warning(s)${infos ? `, ${infos} transient note(s) (seen at one sample only)` : ""}`);
}
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
