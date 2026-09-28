// pixel-16bit: a 160×90 logical canvas scaled ×12 with no smoothing, a fixed
// palette and a sprite state machine (IDLE → CHARGE → CAST → RECOVER). Every
// move is stepped so poses change at ~10 fps even though the video is 30 fps.
// A wizard casts the lesson: coins fall in two groups, then merge and count.
// Facts: the total is a + b, computed here.
import { esc, r3, rng, assertFact } from "../lib.mjs";

const SPR = {
  wizard: [
    ".....HH.......",
    "....HHHH......",
    "...HHHHHH.....",
    "..hhhhhhhh....",
    "....SSSS......",
    "....SESE......",
    "....BBBB......",
    "...BBBBBB..O..",
    "..RRBBBBRR.W..",
    "..RRRRRRRRRW..",
    "..RRRRRRRR.W..",
    "...RRRRRR..W..",
    "...RRrrRR..W..",
    "..RRRrrRRR.W..",
    "..rr....rr.W..",
  ],
  coin: [".YYY.", "YYyYY", "YYyYY", "YYyYY", ".YYY."],
};
const PAL = { H: "#5b3fd6", h: "#f5c542", S: "#f2c9a0", E: "#1a1a2e", B: "#e8e8f0", R: "#3a2fa8", r: "#2a2080", W: "#8b5a2b", O: "#7ff5ff", Y: "#ffd23f", y: "#e89a1a" };
const sprite = (name) =>
  SPR[name].flatMap((row, y) => [...row].map((c, x) => (c === "." ? "" : `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[c]}"/>`))).join("");

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("pixel");
  const { a, b } = spec.sum;
  const total = a + b;
  assertFact(total <= 10, "pixel-16bit fits at most 10 coins on screen");
  console.log(`✓ ${a} + ${b} = ${total}`);
  const LW = 160, LH = 90, S = W / LW;
  const R = rng(spec.seed || 5);
  css.push(`
#stage{position:absolute;inset:0;background:#0f0b2e;overflow:hidden}
#px{position:absolute;left:0;top:0;width:${W}px;height:${H}px;image-rendering:pixelated}
.t{position:absolute;left:0;right:0;text-align:center;font:400 ${S * 5}px/1 "Press Start 2P";color:#fff;text-shadow:${S / 2}px ${S / 2}px 0 #1a1a2e;opacity:0}
.lbl{position:absolute;font:400 ${S * 3}px/1 "Press Start 2P";color:#fff;opacity:0}
.st{position:absolute;left:${S * 4}px;top:${S * 4}px;font:400 ${S * 2}px/1 "Press Start 2P";color:#7ff5ff}
`);
  const stars = Array.from({ length: 40 }, () => `<rect x="${Math.floor(R() * LW)}" y="${Math.floor(R() * 50)}" width="1" height="1" fill="${R() < 0.3 ? "#ffd23f" : "#9fa4ff"}"/>`).join("");
  const bands = ["#1b1450", "#261a6b", "#34208a", "#4a27a3"].map((c, k) => `<rect x="0" y="${30 + k * 9}" width="${LW}" height="9" fill="${c}"/>`).join("");
  // dithered edge between bands (ordered 2x2 checker)
  const dither = [0, 1, 2].map((k) => Array.from({ length: LW / 2 }, (_, i) => `<rect x="${i * 2 + (k % 2)}" y="${38 + k * 9}" width="1" height="1" fill="${["#261a6b", "#34208a", "#4a27a3"][k]}"/>`).join("")).join("");
  const ground = `<rect x="0" y="70" width="${LW}" height="20" fill="#2d6b3a"/><rect x="0" y="70" width="${LW}" height="2" fill="#5fbf4a"/>` + Array.from({ length: 30 }, (_, i) => `<rect x="${i * 6 + 2}" y="${74 + (i % 3) * 4}" width="2" height="1" fill="#24552e"/>`).join("");
  const WX = 20, WY = 55;
  const coinX = (k, merged) => (merged ? 60 + k * 9 : k < a ? 58 + k * 8 : 64 + a * 8 + (k - a) * 8);
  const coins = Array.from({ length: total }, (_, k) => `<g transform="translate(${coinX(k, false)} 62)"><g id="c${k}">${sprite("coin")}</g></g>`).join("");
  const parts = Array.from({ length: 10 }, (_, k) => {
    const ang = (k / 10) * 2 * Math.PI;
    return { id: `pt${k}`, x: Math.round(WX + 11 + Math.cos(ang) * 14), y: Math.round(WY + 7 + Math.sin(ang) * 12) };
  });
  html.push(`<div id="stage"><svg id="px" viewBox="0 0 ${LW} ${LH}" shape-rendering="crispEdges">
<rect width="${LW}" height="${LH}" fill="#0f0b2e"/>${bands}${dither}${stars}<g><rect x="128" y="8" width="10" height="10" fill="#fff6c9"/><rect x="126" y="10" width="14" height="6" fill="#fff6c9"/><rect x="131" y="10" width="3" height="3" fill="#e9dca0"/></g>${ground}
<g transform="translate(${WX + 11.5} ${WY + 7.5})"><g id="glow" opacity="0"><rect x="-2" y="-2" width="4" height="4" fill="#7ff5ff" opacity=".5"/><rect x="-1" y="-1" width="2" height="2" fill="#fff"/></g></g>
${parts.map((p) => `<rect id="${p.id}" x="${p.x}" y="${p.y}" width="1" height="1" fill="#7ff5ff" opacity="0"/>`).join("")}
<g transform="translate(${WX} ${WY})"><g id="wz">${sprite("wizard")}</g></g>
<rect id="bolt" x="${WX + 12}" y="${WY + 7}" width="${120 - WX}" height="1" fill="#7ff5ff" opacity="0"/>
${coins}
</svg>
<div class="st" id="state">IDLE</div>
<div class="t" id="q" style="top:${S * 12}px">${esc(`${a} + ${b} = ?`)}</div>
<div class="t" id="ans" style="top:${S * 12}px">${esc(`${a} + ${b} = ${total}`)}</div>
${Array.from({ length: total }, (_, k) => `<div class="lbl" id="n${k}" style="left:${r3((coinX(k, true) + 0.5) * S)}px;top:${S * 72}px;width:${S * 5}px;text-align:center">${k + 1}</div>`).join("")}
</div>`);
  const st = (t, name) => js.push(`tl.set("#state",{textContent:"${name}"},${r3(t)});`);
  const snaps = [];
  // IDLE: 1 px bob at 2 fps
  js.push(`tl.to("#q",{opacity:1,duration:.3,ease:"steps(3)"},.2);`);
  js.push(`tl.to("#wz",{y:-1,duration:.5,ease:"steps(1)",repeat:3,yoyo:true},0);`);
  snaps.push(1.2);
  // CHARGE: particles converge on the orb
  const tc = 2.2;
  st(tc, "CHARGE");
  parts.forEach((p, k) => {
    js.push(`tl.set("#${p.id}",{opacity:1},${r3(tc + k * 0.03)});`);
    js.push(`tl.to("#${p.id}",{x:${WX + 11 - p.x},y:${WY + 7 - p.y},duration:.8,ease:"steps(8)"},${r3(tc + k * 0.03)});`);
    js.push(`tl.set("#${p.id}",{opacity:0},${r3(tc + 0.85 + k * 0.03)});`);
  });
  js.push(`tl.set("#glow",{opacity:1},${r3(tc + 0.3)});`);
  js.push(`tl.fromTo("#glow",{scale:1,svgOrigin:"0 0"},{scale:2,svgOrigin:"0 0",duration:.8,ease:"steps(4)"},${r3(tc + 0.3)});`);
  sfx.push({ t: tc, kind: "jump" }, { t: tc + 0.5, kind: "blip", p: 4 }, { t: tc + 0.8, kind: "blip", p: 8 });
  snaps.push(tc + 0.7);
  // CAST: bolt, then coins fall in two groups
  const ta = tc + 1.4;
  st(ta, "CAST");
  js.push(`tl.set("#glow",{opacity:0},${r3(ta + 0.3)});`);
  js.push(`tl.set("#bolt",{opacity:1},${r3(ta)});`);
  js.push(`tl.set("#bolt",{opacity:0},${r3(ta + 0.2)});`);
  js.push(`tl.set("#bolt",{opacity:1},${r3(ta + 0.3)});`);
  js.push(`tl.set("#bolt",{opacity:0},${r3(ta + 0.4)});`);
  sfx.push({ t: ta, kind: "whoosh" });
  for (let k = 0; k < total; k++) {
    const t0 = ta + 0.5 + (k < a ? k * 0.2 : 0.8 + k * 0.2);
    js.push(`tl.from("#c${k}",{y:-70,duration:.5,ease:"steps(6)"},${r3(t0)});`);
    sfx.push({ t: t0 + 0.5, kind: "coin" });
  }
  snaps.push(ta + 0.9 + total * 0.2 + 0.6);
  // RECOVER: coins merge into one row and get counted
  const tr = ta + 1.3 + total * 0.2 + 1.2;
  st(tr, "RECOVER");
  for (let k = 0; k < total; k++) js.push(`tl.to("#c${k}",{x:${coinX(k, true) - coinX(k, false)},duration:.5,ease:"steps(5)"},${r3(tr)});`);
  for (let k = 0; k < total; k++) {
    js.push(`tl.set("#n${k}",{opacity:1},${r3(tr + 0.7 + k * 0.25)});`);
    sfx.push({ t: tr + 0.7 + k * 0.25, kind: "blip", p: k });
  }
  const tf = tr + 0.9 + total * 0.25;
  js.push(`tl.set("#q",{opacity:0},${r3(tf)});`);
  js.push(`tl.set("#ans",{opacity:1},${r3(tf)});`);
  js.push(`tl.fromTo("#ans",{scale:1.3},{scale:1,duration:.3,ease:"steps(3)"},${r3(tf)});`);
  sfx.push({ t: tf, kind: "coin" }, { t: tf + 0.15, kind: "coin" });
  st(tf + 0.6, "IDLE");
  js.push(`tl.to("#wz",{y:-1,duration:.5,ease:"steps(1)",repeat:3,yoyo:true},${r3(tf + 0.6)});`);
  snaps.push(tf + 1);
  ctx.duration = r3(tf + 2.6);
  ctx.snapshots = snaps;
}
