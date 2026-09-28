// one-shot-morph: a single shape turns into every state of the explanation.
// No cuts, no fades between scenes: the cursor clicks and the same element
// grows, shrinks and changes colour into the next state (the "one continuous
// take" UI launch videos). The shape is one full-frame layer whose visible box
// is a clip-path inset, so every morph is interpolable and transform-free.
// Facts: the fraction example derives decimal and percent from num/den.
import { esc, r3, inset, assertFact } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  const P = { bg: "#efede8", ink: "#111", accent: "#ff5a36", paper: "#ffffff", ...(spec.palette || {}) };
  ctx.fonts.add("inter").add("mono");
  const { num, den } = spec.fraction;
  assertFact(Number.isInteger(num) && Number.isInteger(den) && den > 0 && num <= den, "fraction must be a proper fraction");
  const dec = num / den;
  const pct = Math.round(dec * 1000) / 10;
  const decS = String(Math.round(dec * 1000) / 1000).replace(/^0/, "0");
  console.log(`✓ ${num}/${den} = ${decS} = ${pct}%`);
  const fill = (s) => s.replace(/\{num\}/g, num).replace(/\{den\}/g, den).replace(/\{dec\}/g, decS).replace(/\{pct\}/g, `${pct}%`);

  const cx = W / 2, cy = H / 2;
  const box = (w, h, r, dy = 0) => ({ x: cx - w / 2, y: cy - h / 2 + dy, w, h, r });
  // state boxes: pill -> card with pie -> bar -> big circle -> summary pill
  const S = [
    { b: box(420, 110, 55), bg: P.ink },
    { b: box(980, 620, 40), bg: P.paper },
    { b: box(1440, 260, 28), bg: P.accent },
    { b: box(560, 560, 280), bg: P.ink },
    { b: box(1180, 150, 75), bg: P.paper },
  ];
  const step = spec.step || 2.9;
  css.push(`
#stage{position:absolute;inset:0;background:${P.bg};font-family:Inter,sans-serif}
#stage:before{content:"";position:absolute;inset:0;background-image:radial-gradient(#d9d5cc 1.2px,transparent 1.4px);background-size:28px 28px;opacity:.7}
#shape{position:absolute;inset:0;background:${S[0].bg};clip-path:${inset(S[0].b, W, H)};box-shadow:0 0 0 0 transparent}
.st{position:absolute;display:flex;align-items:center;justify-content:center;flex-direction:column;opacity:0;text-align:center}
.pill{color:#fff;font-weight:700;font-size:46px;letter-spacing:-.02em}
.pill b{font:500 30px "Plex Mono";opacity:.6;margin-left:14px}
.lbl{font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;opacity:.6}
.big{font-weight:900;letter-spacing:-.05em;line-height:.9}
.segs{display:flex;gap:12px;width:880px;height:120px}
.segs i{flex:1;border-radius:14px;background:rgba(255,255,255,.35)}
.segs i.on{background:#fff}
.cap{position:absolute;left:96px;top:80px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#8a857b}
.tc{position:absolute;right:96px;top:80px;font:500 22px "Plex Mono";color:#8a857b}
#cur{position:absolute;left:0;top:0;width:44px;height:44px;z-index:5}
#rip{position:absolute;left:-40px;top:-40px;width:80px;height:80px;border-radius:50%;border:4px solid ${P.accent};opacity:0}
`);
  // pie for state 1
  const R = 170, pie = [];
  for (let k = 0; k < den; k++) {
    const a0 = (k / den) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / den) * 2 * Math.PI - Math.PI / 2;
    const p = (a) => `${r3(R + R * Math.cos(a))} ${r3(R + R * Math.sin(a))}`;
    pie.push(`<path id="pz${k}" d="M ${R} ${R} L ${p(a0)} A ${R} ${R} 0 0 1 ${p(a1)} Z" fill="${k < num ? P.accent : "#ece8e0"}" stroke="#fff" stroke-width="6"/>`);
  }
  const at = (i, style) => `left:${r3(S[i].b.x)}px;top:${r3(S[i].b.y)}px;width:${r3(S[i].b.w)}px;height:${r3(S[i].b.h)}px;${style || ""}`;
  const T = spec.text || {};
  html.push(`<div id="stage"><div class="cap">${esc(spec.kicker || "")}</div><div class="tc">${esc(spec.folio || "")}</div>
<div id="shape"></div>
<div class="st" id="s0" style="${at(0)}"><div class="pill">${esc(fill(T.start || "{num}/{den}"))}<b>${esc(T.startHint || "¿qué es?")}</b></div></div>
<div class="st" id="s1" style="${at(1, `color:${P.ink};flex-direction:row;gap:70px`)}"><svg width="${2 * R}" height="${2 * R}">${pie.join("")}</svg>
  <div style="text-align:left"><div class="lbl">${esc(T.pieLabel || "la fracción")}</div><div class="big" style="font-size:200px">${num}<span style="color:${P.accent}">/</span>${den}</div><div style="font-size:36px;margin-top:10px">${esc(fill(T.pie || "{num} de {den} partes"))}</div></div></div>
<div class="st" id="s2" style="${at(2, "color:#fff;flex-direction:row;gap:60px")}"><div style="text-align:left"><div class="lbl" style="opacity:.85">${esc(T.barLabel || "en decimal")}</div><div class="big" style="font-size:120px;margin-top:8px">${esc(decS)}</div></div><div class="segs">${Array.from({ length: den }, (_, k) => `<i id="sg${k}" class="${k < num ? "on" : ""}"></i>`).join("")}</div></div>
<div class="st" id="s3" style="${at(3, "color:#fff")}"><div class="lbl">${esc(T.pctLabel || "en porcentaje")}</div><div class="big" style="font-size:190px;margin-top:12px">${pct}<span style="color:${P.accent}">%</span></div></div>
<div class="st" id="s4" style="${at(4, `color:${P.ink}`)}"><div class="big" style="font-size:72px;letter-spacing:-.03em">${esc(fill(T.end || "{num}/{den} = {dec} = {pct}"))}</div></div>
<svg id="cur" viewBox="0 0 44 44"><path d="M6 4 L6 36 L14 28 L20 41 L26 38 L20 26 L32 26 Z" fill="#111" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>
<div id="rip"></div></div>`);

  const snaps = [];
  js.push(`tl.to("#s0",{opacity:1,duration:.4},.3);`);
  js.push(`tl.set("#cur",{x:${W - 300},y:${H - 160}},0);`);
  js.push(`tl.set("#rip",{x:${W - 300},y:${H - 160},scale:.2},0);`);
  snaps.push(1.2);
  let t = 0.3;
  for (let i = 1; i < S.length; i++) {
    const tc = t + step - 0.9; // cursor arrives and clicks
    const target = { x: S[i - 1].b.x + S[i - 1].b.w * 0.72, y: S[i - 1].b.y + S[i - 1].b.h * 0.62 };
    js.push(`tl.to("#cur",{x:${r3(target.x)},y:${r3(target.y)},duration:.6,ease:"power3.inOut"},${r3(tc - 0.6)});`);
    js.push(`tl.to("#cur",{scale:.82,duration:.08,yoyo:true,repeat:1},${r3(tc)});`);
    js.push(`tl.set("#rip",{x:${r3(target.x)},y:${r3(target.y)},opacity:1,scale:.2},${r3(tc)});`);
    js.push(`tl.to("#rip",{scale:1.6,opacity:0,duration:.45,ease:"power2.out"},${r3(tc + 0.01)});`);
    sfx.push({ t: tc, kind: "click" });
    const tm = tc + 0.12;
    js.push(`tl.to("#s${i - 1}",{opacity:0,duration:.18},${r3(tm)});`);
    js.push(`tl.to("#shape",{clipPath:"${inset(S[i].b, W, H)}",backgroundColor:"${S[i].bg}",duration:.75,ease:"back.out(1.25)"},${r3(tm)});`);
    js.push(`tl.to("#s${i}",{opacity:1,duration:.35,ease:"power2.out"},${r3(tm + 0.5)});`);
    sfx.push({ t: tm, kind: "whoosh" });
    if (i === 1) {
      for (let k = 0; k < den; k++) js.push(`tl.fromTo("#pz${k}",{scale:0,svgOrigin:"${R} ${R}"},{scale:1,svgOrigin:"${R} ${R}",duration:.35,ease:"back.out(2)"},${r3(tm + 0.55 + k * 0.1)});`);
      sfx.push(...Array.from({ length: den }, (_, k) => ({ t: tm + 0.55 + k * 0.1, kind: "pop" })));
    }
    if (i === 2) {
      // the bar splits into den segments inside the accent shape
      for (let k = 0; k < den; k++) js.push(`tl.fromTo("#sg${k}",{scaleY:0},{scaleY:1,duration:.3,ease:"back.out(2)"},${r3(tm + 0.6 + k * 0.08)});`);
    }
    t = tm;
    snaps.push(tm + 1.4);
  }
  // cursor leaves
  js.push(`tl.to("#cur",{x:${W + 80},y:${H + 80},duration:.8,ease:"power2.in"},${r3(t + 0.9)});`);
  sfx.push({ t: t + 0.6, kind: "ding" });
  ctx.duration = r3(t + 2.6);
  ctx.snapshots = snaps;
}
