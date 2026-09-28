// cinematic-essay: deep dark field, one warm accent that shifts stage by
// stage, never more than ~8 words on screen, and transitions that come from
// the content: the camera flies into a node of the constellation and the
// stage lives inside it, then pulls back out to light the next node. For long
// topics told as a chain (history of an idea, chapters of a book).
import { esc, r3, rng, assertFact } from "../lib.mjs";

const MOTIF = {
  sphere: (c) => `<circle cx="0" cy="0" r="150" pathLength="1" class="dr" stroke="${c}"/>`,
  pudding: (c) => `<circle cx="0" cy="0" r="160" pathLength="1" class="dr" stroke="${c}"/>` + [[-60, -50], [50, -70], [-20, 30], [70, 40], [-80, 70], [20, 100], [0, -110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}" class="dot"/>`).join(""),
  nucleus: (c) => `<circle cx="0" cy="0" r="16" fill="${c}" class="dot"/>` + [0, 60, 120].map((a) => `<ellipse cx="0" cy="0" rx="190" ry="62" transform="rotate(${a})" pathLength="1" class="dr" stroke="${c}"/>`).join(""),
  shells: (c) => `<circle cx="0" cy="0" r="18" fill="${c}" class="dot"/>` + [70, 130, 190].map((r) => `<circle cx="0" cy="0" r="${r}" pathLength="1" class="dr" stroke="${c}"/>`).join("") + [[70, 0], [0, -130], [-134, 134]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff" class="dot"/>`).join(""),
};

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("serif").add("mono").add("inter");
  const stages = spec.stages;
  const count = (s) => s.split(/\s+/).filter(Boolean).length;
  for (const s of [spec.open, spec.close, ...stages.map((x) => x.line)]) assertFact(count(s) <= 8, `"${s}" has more than 8 words`);
  const R = rng(spec.seed || 9);
  const acc = spec.accents || ["#ffd08a", "#ffb04d", "#ff8a3d", "#ff6236"];
  css.push(`
#stage{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,#121726 0%,#07090f 70%);color:#f4efe6;overflow:hidden}
#world{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
.star{position:absolute;width:3px;height:3px;border-radius:50%;background:#8d95ad}
.nd{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2px solid #5a6178;background:#07090f}
.nd i{position:absolute;inset:5px;border-radius:50%;background:#5a6178}
.nl{position:absolute;font:500 18px "Plex Mono";letter-spacing:.14em;color:#6f7690;text-transform:uppercase;white-space:nowrap;transform:translate(-50%,26px)}
svg.lk{position:absolute;left:0;top:0}
.sc{position:absolute;inset:0;opacity:0}
.sc svg{position:absolute;left:${W / 2 - 220}px;top:${H / 2 - 390}px;overflow:visible}
.dr{fill:none;stroke-width:3;stroke-dasharray:1;stroke-dashoffset:1}
.yr{position:absolute;left:0;right:0;top:${H / 2 + 40}px;text-align:center;font:500 22px "Plex Mono";letter-spacing:.24em}
.ln{position:absolute;left:0;right:0;top:${H / 2 + 90}px;text-align:center;font:italic 400 84px/1.05 "Instrument Serif"}
.big{position:absolute;left:0;right:0;top:${H / 2 - 60}px;text-align:center;font:italic 400 110px/1 "Instrument Serif";opacity:0}
.ttl{position:absolute;left:0;right:0;top:${H / 2 + 90}px;text-align:center;font:500 24px "Plex Mono";letter-spacing:.3em;text-transform:uppercase;opacity:0}
`);
  // constellation: stages on a gentle arc plus seeded filler nodes
  const nodes = stages.map((s, i) => ({ x: 380 + i * ((W - 760) / Math.max(1, stages.length - 1)), y: H / 2 + 110 * Math.sin((i / Math.max(1, stages.length - 1)) * Math.PI) - 40 }));
  const filler = Array.from({ length: 10 }, () => ({ x: 120 + R() * (W - 240), y: 140 + R() * (H - 280) }));
  const stars = Array.from({ length: 140 }, () => `<div class="star" style="left:${r3(R() * W)}px;top:${r3(R() * H)}px;opacity:${r3(0.2 + R() * 0.6)}"></div>`).join("");
  const links = nodes.slice(1).map((n, i) => `<line id="lk${i}" x1="${r3(nodes[i].x)}" y1="${r3(nodes[i].y)}" x2="${r3(n.x)}" y2="${r3(n.y)}" stroke="#39405a" stroke-width="2" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join("") +
    filler.map((f, k) => { const n = nodes[k % nodes.length]; return `<line x1="${r3(f.x)}" y1="${r3(f.y)}" x2="${r3(n.x)}" y2="${r3(n.y)}" stroke="#1d2233" stroke-width="1.5"/>`; }).join("");
  html.push(`<div id="stage"><div id="world">${stars}<svg class="lk" width="${W}" height="${H}">${links}</svg>
${filler.map((f) => `<div class="nd" style="left:${r3(f.x)}px;top:${r3(f.y)}px;transform:scale(.5)"><i></i></div>`).join("")}
${nodes.map((n, i) => `<div class="nd" id="nd${i}" style="left:${r3(n.x)}px;top:${r3(n.y)}px"><i id="ndi${i}"></i></div><div class="nl" style="left:${r3(n.x)}px;top:${r3(n.y)}px">${esc(stages[i].name)}</div>`).join("")}
</div>
<div class="big" id="open">${esc(spec.open)}</div>
${stages.map((s, i) => `<div class="sc" id="sc${i}"><svg width="440" height="440" viewBox="-300 -300 600 600">${MOTIF[s.motif](acc[i % acc.length])}</svg><div class="yr" style="color:${acc[i % acc.length]}">${esc(s.when)} · ${esc(s.name)}</div><div class="ln">${esc(s.line)}</div></div>`).join("")}
<div class="big" id="close" style="top:${H / 2 - 120}px">${esc(spec.close)}</div><div class="ttl" id="ttl" style="color:${acc[acc.length - 1]}">${esc(spec.title)}</div>
</div>`);
  const cam = (n, s) => ({ x: r3(W / 2 - n.x * s), y: r3(H / 2 - n.y * s), scale: s });
  const snaps = [];
  // cold open
  js.push(`tl.to("#open",{opacity:1,duration:1,ease:"power2.out"},.3);`);
  js.push(`tl.to("#open",{opacity:0,duration:.6},3);`);
  js.push(`tl.fromTo("#world",{opacity:0,scale:1.08,x:${r3(-W * 0.04)},y:${r3(-H * 0.04)}},{opacity:1,scale:1,x:0,y:0,duration:1.6,ease:"power2.out"},3.2);`);
  sfx.push({ t: 0.3, kind: "whoosh" });
  snaps.push(1.8);
  let t = 4.4;
  stages.forEach((s, i) => {
    const c = acc[i % acc.length];
    if (i > 0) js.push(`tl.to("#lk${i - 1}",{strokeDashoffset:0,duration:.6,ease:"power2.inOut"},${r3(t - 0.2)});`);
    js.push(`tl.to("#ndi${i}",{backgroundColor:"${c}",duration:.3},${r3(t + 0.2)});`);
    js.push(`tl.to("#nd${i}",{borderColor:"${c}",scale:1.4,duration:.4,ease:"back.out(3)"},${r3(t + 0.2)});`);
    sfx.push({ t: t + 0.2, kind: "ding" });
    // fly into the node
    const tin = t + 0.8;
    const k = cam(nodes[i], 14);
    js.push(`tl.to("#world",{x:${k.x},y:${k.y},scale:${k.scale},duration:1,ease:"power3.in"},${r3(tin)});`);
    js.push(`tl.to("#world",{opacity:0,duration:.25},${r3(tin + 0.8)});`);
    sfx.push({ t: tin + 0.4, kind: "whoosh" });
    const ts = tin + 0.9;
    js.push(`tl.to("#sc${i}",{opacity:1,duration:.5},${r3(ts)});`);
    js.push(`tl.fromTo("#sc${i} svg",{scale:.6,transformOrigin:"50% 50%"},{scale:1,duration:3.2,ease:"power2.out"},${r3(ts)});`);
    js.push(`tl.to("#sc${i} .dr",{strokeDashoffset:0,duration:1.2,ease:"power2.inOut",stagger:.15},${r3(ts + 0.2)});`);
    js.push(`tl.fromTo("#sc${i} .dot",{opacity:0},{opacity:1,duration:.3,stagger:.08},${r3(ts + 0.6)});`);
    const hold = Math.max(2.5, s.hold || 2.6);
    snaps.push(ts + 1.8);
    // back out to the constellation
    const tout = ts + hold;
    js.push(`tl.to("#sc${i}",{opacity:0,duration:.4},${r3(tout)});`);
    js.push(`tl.to("#world",{opacity:1,duration:.3},${r3(tout + 0.1)});`);
    js.push(`tl.to("#world",{x:0,y:0,scale:1,duration:1,ease:"power3.out"},${r3(tout + 0.1)});`);
    t = tout + 1.2;
  });
  // everything converges; the first motif returns with the title
  js.push(`tl.to("#world",{scale:.9,x:${r3(W * 0.05)},y:${r3(H * 0.05)},opacity:.25,duration:1.2,ease:"power2.inOut"},${r3(t)});`);
  js.push(`tl.to("#close",{opacity:1,duration:1},${r3(t + 0.4)});`);
  js.push(`tl.to("#ttl",{opacity:1,duration:1},${r3(t + 1.1)});`);
  sfx.push({ t: t + 0.4, kind: "ding" });
  snaps.push(t + 2.2);
  ctx.duration = r3(t + 3.6);
  ctx.snapshots = snaps;
}
