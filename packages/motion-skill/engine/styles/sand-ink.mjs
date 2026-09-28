// sand-ink: sand animation on a light table. A few hundred grains gather into
// each figure, a hand sweeps them away, and the next scene forms from the same
// sand. Built for history and literature timelines. Grain targets are sampled
// with a seeded PRNG at build time, so the page only replays fixed tweens.
import { esc, r3, rng } from "../lib.mjs";

// Figures are inside-tests over the 1920×1080 frame.
const tri = (ax, ay, bx, by, cx, cy) => (x, y) => {
  const s = (px, py, qx, qy, rx, ry) => (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
  const d1 = s(x, y, ax, ay, bx, by), d2 = s(x, y, bx, by, cx, cy), d3 = s(x, y, cx, cy, ax, ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
const ring = (cx, cy, r0, r1) => (x, y) => { const d = Math.hypot(x - cx, y - cy); return d >= r0 && d <= r1; };
const rect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const quad = (pts) => (x, y) => tri(...pts[0], ...pts[1], ...pts[2])(x, y) || tri(...pts[0], ...pts[2], ...pts[3])(x, y);
const any = (...fs) => (x, y) => fs.some((f) => f(x, y));
const FIG = {
  pyramids: { box: [560, 250, 1560, 740], in: any(tri(620, 730, 900, 380, 1180, 730), tri(1060, 730, 1250, 500, 1440, 730), ring(1420, 320, 52, 70), rect(560, 726, 1500, 740)) },
  arch: { box: [640, 330, 1280, 740], in: (x, y) => rect(700, 380, 1220, 730)(x, y) && !(Math.hypot(x - 960, y - 560) < 150 || rect(810, 560, 1110, 740)(x, y)) || rect(660, 350, 1260, 382)(x, y) || rect(640, 726, 1280, 740)(x, y) },
  // open book: two pages with lines of "text" left as light gaps
  book: { box: [600, 430, 1320, 760], in: (x, y) => any(quad([[620, 470], [950, 510], [950, 750], [620, 710]]), quad([[970, 510], [1300, 470], [1300, 710], [970, 750]]))(x, y) && !((x > 660 && x < 920 || x > 1000 && x < 1260) && ((y - (x < 960 ? (x - 620) * 0.12 : (1300 - x) * 0.12)) % 36) > 28 && y > 520 && y < 700) },
  wave: { box: [560, 420, 1360, 760], in: (x, y) => y > 600 + 60 * Math.sin((x - 560) / 80) && y < 740 && x > 560 && x < 1360 || ring(1180, 460, 30, 48)(x, y) },
};

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("serif").add("mono");
  const R = rng(spec.seed || 3);
  const N = spec.grains || 1600;
  const scenes = spec.scenes;
  const sample = (fig) => {
    const f = FIG[fig];
    const [x0, y0, x1, y1] = f.box;
    const pts = [];
    let guard = 0;
    while (pts.length < N && guard++ < N * 400) {
      const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
      if (f.in(x, y)) pts.push([x, y]);
    }
    return pts;
  };
  const pile = () => Array.from({ length: N }, () => { const u = R(); return [200 + R() * 1520, 1010 - Math.sqrt(u) * 70 * Math.sin(Math.PI * R())]; });
  css.push(`
#stage{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 58%,#fff4dc 0%,#f2d7a4 45%,#c99a5c 100%);overflow:hidden}
#stage:after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(90,50,10,.12) 1px,transparent 1.4px);background-size:5px 5px;mix-blend-mode:multiply}
.g{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#3a2412}
#hand{position:absolute;left:0;top:380px;width:820px;height:360px;border-radius:50%;background:#2a170a;filter:blur(40px);opacity:0}
.era{position:absolute;left:110px;top:90px;color:#3a2412;opacity:0}
.era b{display:block;font:500 24px "Plex Mono";letter-spacing:.16em;text-transform:uppercase;opacity:.7}
.era i{display:block;font:italic 400 92px/1 "Instrument Serif";margin-top:10px}
.era span{display:block;font:400 38px/1.2 "Instrument Serif";margin-top:14px;max-width:760px}
`);
  let pos = pile();
  const gHtml = pos.map((p, k) => `<div class="g" id="g${k}"></div>`).join("");
  html.push(`<div id="stage">${gHtml}<div id="hand"></div>${scenes.map((s, i) => `<div class="era" id="e${i}"><b>${esc(s.when)}</b><i>${esc(s.title)}</i><span>${esc(s.line || "")}</span></div>`).join("")}</div>`);
  js.push(pos.map((p, k) => `tl.set("#g${k}",{x:${r3(p[0])},y:${r3(p[1])}},0);`).join(""));
  let t = 0.4;
  const snaps = [];
  scenes.forEach((s, i) => {
    const tgt = sample(s.figure);
    // grains rise from where they lie, bottom-up, into the figure
    const form = tgt.map((p, k) => `tl.to("#g${k}",{x:${r3(p[0])},y:${r3(p[1])},duration:${r3(1.1 + R() * 0.5)},ease:"power2.inOut"},${r3(t + R() * 0.7)});`);
    js.push(form.join(""));
    sfx.push({ t, kind: "pour", len: 1.8 });
    js.push(`tl.to("#e${i}",{opacity:1,duration:.8},${r3(t + 0.9)});`);
    pos = tgt;
    snaps.push(t + 2.6);
    const ts = t + 2.3 + (s.hold || 1.6);
    if (i < scenes.length - 1) {
      // the hand sweeps left to right; grains slide right and settle low
      js.push(`tl.set("#hand",{x:-900,opacity:.45},${r3(ts)});tl.to("#hand",{x:${W + 100},duration:1.1,ease:"power1.inOut"},${r3(ts + 0.01)});`);
      js.push(`tl.to("#e${i}",{opacity:0,duration:.4},${r3(ts)});`);
      const sw = pos.map((p, k) => {
        const d = ts + ((p[0] + 900) / (W + 1000)) * 1.1 * 0.8;
        const nx = Math.min(W - 40, p[0] + 180 + R() * 420), ny = 930 + R() * 120;
        pos[k] = [nx, ny];
        return `tl.to("#g${k}",{x:${r3(nx)},y:${r3(ny)},duration:.7,ease:"power2.out"},${r3(d)});`;
      });
      js.push(sw.join(""));
      sfx.push({ t: ts, kind: "whoosh" }, { t: ts + 0.3, kind: "pour", len: 0.9 });
      snaps.push(ts + 0.6);
      t = ts + 1.7;
    } else t = ts;
  });
  ctx.duration = r3(t + 0.6);
  ctx.snapshots = snaps;
}
