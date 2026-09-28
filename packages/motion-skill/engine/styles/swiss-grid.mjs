// swiss-grid: technical-poster look. Light grey paper with a construction
// grid, heavy geometric type, orange rules, and cuts that break into grey
// pixel blocks for ~0.3 s. One poster per idea: good for unit covers and
// syllabi. Block order comes from a seeded PRNG, so every render matches.
// Facts: a "graph" poster plots y = m·x + b from its own numbers.
import { esc, r3, rng } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("inter").add("mono");
  const P = { paper: "#e6e5e1", ink: "#121212", orange: "#ff4d00", g1: "#a4a39e", g2: "#c9c8c3", ...(spec.palette || {}) };
  const posters = spec.posters;
  const hold = spec.hold || 2.4;
  const B = 120, cols = W / B, rows = H / B;
  css.push(`
#stage{position:absolute;inset:0;background:${P.paper};color:${P.ink};font-family:Inter,sans-serif;overflow:hidden}
#grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.07) 1px,transparent 1px);background-size:${B}px ${B}px}
.pst{position:absolute;inset:0;visibility:hidden}
.num{position:absolute;left:${B}px;top:${B}px;font:900 150px/1 Inter;letter-spacing:-.06em}
.meta{position:absolute;left:${B + 6}px;top:${B + 170}px;font:500 22px/1.5 "Plex Mono";text-transform:uppercase;letter-spacing:.08em}
.word{position:absolute;left:${B - 8}px;bottom:${B * 2 - 20}px;font:900 250px/.85 Inter;letter-spacing:-.065em;white-space:nowrap}
.note{position:absolute;left:${B}px;bottom:${B}px;width:${B * 7}px;font:700 40px/1.15 Inter;letter-spacing:-.02em}
.foot{position:absolute;right:${B}px;bottom:${B}px;font:500 20px "Plex Mono";letter-spacing:.12em;text-transform:uppercase}
.blk{position:absolute;width:${B}px;height:${B}px;opacity:0}
svg.sh{position:absolute;left:0;top:0;overflow:visible}
`);
  const R = rng(spec.seed || 11);
  const blocks = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) blocks.push({ id: `k${r}_${c}`, x: c * B, y: r * B, col: R() < 0.5 ? P.g1 : P.g2 });
  const shapeSvg = (p, i) => {
    const s = p.shape;
    if (s === "line") return `<svg class="sh" width="${W}" height="${H}"><line id="sp${i}" x1="${B * 9}" y1="${B * 3}" x2="${B * 15}" y2="${B * 3}" stroke="${P.orange}" stroke-width="18" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><line x1="${B * 9}" y1="${B * 3 - 40}" x2="${B * 9}" y2="${B * 3 + 40}" stroke="${P.ink}" stroke-width="6"/><line x1="${B * 15}" y1="${B * 3 - 40}" x2="${B * 15}" y2="${B * 3 + 40}" stroke="${P.ink}" stroke-width="6"/></svg>`;
    if (s === "circle") return `<svg class="sh" width="${W}" height="${H}"><circle id="sp${i}" cx="${B * 12}" cy="${B * 3.5}" r="${B * 2}" fill="none" stroke="${P.orange}" stroke-width="18" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 ${B * 12} ${B * 3.5})"/><circle cx="${B * 12}" cy="${B * 3.5}" r="14" fill="${P.ink}"/></svg>`;
    if (s === "stairs") {
      let d = `M ${B * 9} ${B * 5}`;
      for (let k = 0; k < 5; k++) d += ` h ${B} v ${-B * 0.8}`;
      return `<svg class="sh" width="${W}" height="${H}"><path id="sp${i}" d="${d}" fill="none" stroke="${P.orange}" stroke-width="18" stroke-linejoin="miter" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
    }
    if (s === "graph") {
      // y = m x + b over x in [x0, x1], mapped onto a 6x4-cell plot
      const { m, b, x0 = 0, x1 = 5 } = p.graph;
      const ys = [x0, x1].map((x) => m * x + b), ymax = Math.max(...ys, 1), ymin = Math.min(...ys, 0);
      const X = (x) => B * 9 + ((x - x0) / (x1 - x0)) * B * 6, Y = (y) => B * 5.5 - ((y - ymin) / (ymax - ymin)) * B * 4;
      console.log(`✓ graph: y = ${m}x + ${b} from (${x0}, ${ys[0]}) to (${x1}, ${ys[1]})`);
      return `<svg class="sh" width="${W}" height="${H}"><line x1="${B * 9}" y1="${Y(Math.max(0, ymin))}" x2="${B * 15.3}" y2="${Y(Math.max(0, ymin))}" stroke="${P.ink}" stroke-width="5"/><line x1="${B * 9}" y1="${B * 5.6}" x2="${B * 9}" y2="${B * 1.2}" stroke="${P.ink}" stroke-width="5"/><line id="sp${i}" x1="${X(x0)}" y1="${r3(Y(ys[0]))}" x2="${X(x1)}" y2="${r3(Y(ys[1]))}" stroke="${P.orange}" stroke-width="18" stroke-linecap="square" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><text x="${X(x1) - 10}" y="${r3(Y(ys[1]) - 36)}" text-anchor="end" font-family="Plex Mono" font-size="30">y = ${m}x + ${b}</text></svg>`;
    }
    return "";
  };
  html.push(`<div id="stage"><div id="grid"></div>
${posters.map((p, i) => `<div class="pst" id="p${i}"><div class="num">${esc(p.num || String(i + 1).padStart(2, "0"))}</div><div class="meta">${esc(p.meta || "").replace(/\n/g, "<br>")}</div>${shapeSvg(p, i)}<div class="word" id="wd${i}">${esc(p.word)}</div><div class="note">${esc(p.note || "")}</div><div class="foot">${esc(spec.foot || "")}</div></div>`).join("")}
${blocks.map((k) => `<div class="blk" id="${k.id}" style="left:${k.x}px;top:${k.y}px;background:${k.col}"></div>`).join("")}
</div>`);
  const snaps = [];
  let t = 0;
  posters.forEach((p, i) => {
    js.push(`tl.set("#p${i}",{visibility:"visible"},${r3(t)});`);
    js.push(`tl.fromTo("#wd${i}",{xPercent:-4},{xPercent:0,duration:${hold},ease:"none"},${r3(t)});`);
    js.push(`tl.to("#sp${i}",{strokeDashoffset:0,duration:.7,ease:"power3.inOut"},${r3(t + 0.35)});`);
    sfx.push({ t: t + 0.35, kind: "whoosh" });
    snaps.push(t + 1.4);
    const cut = t + hold;
    if (i < posters.length - 1) {
      // pixel break: blocks in (0.15 s), swap poster, blocks out (0.15 s)
      const order = blocks.map((k) => ({ k, r: R() }));
      js.push(order.map(({ k, r }) => `tl.set("#${k.id}",{opacity:1},${r3(cut + r * 0.15)});tl.set("#${k.id}",{opacity:0},${r3(cut + 0.17 + R() * 0.15)});`).join(""));
      js.push(`tl.set("#p${i}",{visibility:"hidden"},${r3(cut + 0.16)});`);
      sfx.push({ t: cut, kind: "snare" }, { t: cut + 0.02, kind: "tick" });
      t = cut + 0.16;
    } else t = cut;
  });
  ctx.duration = r3(t + 0.4);
  ctx.snapshots = snaps;
}
