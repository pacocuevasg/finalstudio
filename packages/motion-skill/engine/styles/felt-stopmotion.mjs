// felt-stopmotion: brown felt table, green felt wall, fabric characters that
// hop at 12 fps with holds, and a bowl that fills with felt balls. Every tween
// is stepped to 12 poses per second and a slight "boil" wobble runs on each
// figure, like hand-moved stop motion. For early-primary counting and sums.
// Facts: the answer banner shows a + b computed here.
import { esc, r3, assertFact } from "../lib.mjs";

const FPS = 12;
const st = (d) => `steps(${Math.max(1, Math.round(d * FPS))})`;

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("hand").add("inter");
  const [A, B] = spec.friends;
  const total = A.balls + B.balls;
  assertFact(total <= 8, "the bowl holds at most 8 balls");
  console.log(`✓ ${A.balls} + ${B.balls} = ${total}`);
  const table = 640;
  const bowl = { x: W / 2, y: table + 170, rx: 250, ry: 120 };
  css.push(`
#stage{position:absolute;inset:0;overflow:hidden;font-family:Caveat,cursive}
#wall{position:absolute;left:0;top:0;width:${W}px;height:${table}px;background:#5f8f52}
#tab{position:absolute;left:0;top:${table}px;width:${W}px;height:${H - table}px;background:#8a5a36}
#tab:before{content:"";position:absolute;left:0;right:0;top:0;height:14px;background:#6f4527}
.tex{position:absolute;inset:0;width:${W}px;height:${H}px;mix-blend-mode:multiply;opacity:.55}
.fig{position:absolute;left:0;top:0}
.body{position:absolute;border-radius:48% 48% 40% 40%;border:3px dashed rgba(255,255,255,.55);box-shadow:inset 0 -18px 0 rgba(0,0,0,.12),0 14px 0 -6px rgba(0,0,0,.25)}
.eye{position:absolute;width:22px;height:22px;border-radius:50%;background:#fff}
.eye:after{content:"";position:absolute;left:7px;top:6px;width:10px;height:10px;border-radius:50%;background:#1a1a1a}
.ball{position:absolute;left:0;top:0;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:#d8403a;border:3px dashed rgba(255,255,255,.5);box-shadow:inset -8px -10px 0 rgba(0,0,0,.15)}
#banner{position:absolute;left:${W / 2 - 330}px;top:70px;width:660px;height:150px;background:#efe2c6;border-radius:14px;border:4px dashed #b99a64;box-shadow:0 10px 0 rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font:700 96px Caveat;color:#5a3a1e}
#banner span{position:absolute;opacity:0}
.cnt{position:absolute;font:700 46px Caveat;color:#fff;opacity:0;text-shadow:0 3px 0 rgba(0,0,0,.35)}
`);
  // felt texture: deterministic SVG turbulence
  const tex = `<svg class="tex" viewBox="0 0 ${W} ${H}"><filter id="felt"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .35  0 0 0 0 .3  0 0 0 .9 0"/></filter><rect width="${W}" height="${H}" filter="url(#felt)"/></svg>`;
  const fig = (id, f, x) => `<div class="fig" id="${id}"><div id="${id}h"><div id="${id}b" style="position:relative">
<div class="body" style="left:-90px;top:-220px;width:180px;height:220px;background:${f.color}"></div>
<div class="eye" style="left:-46px;top:-170px"></div><div class="eye" style="left:22px;top:-170px"></div>
<div style="position:absolute;left:-20px;top:-120px;width:40px;height:16px;border-bottom:5px solid #1a1a1a;border-radius:0 0 20px 20px"></div>
<div style="position:absolute;left:-60px;top:6px;font:700 40px Caveat;color:#fff;width:120px;text-align:center">${esc(f.name)}</div>
</div></div></div>`;
  // ball resting spots inside the bowl
  const spots = Array.from({ length: total }, (_, k) => {
    const row = k < 4 ? 0 : 1, col = row ? k - 4 : k, n = row ? total - 4 : Math.min(4, total);
    return { x: bowl.x + (col - (n - 1) / 2) * 74 + row * 10, y: bowl.y - 78 - row * 62 };
  });
  const startX = [320, W - 320];
  const balls = [];
  let b = 0;
  [A, B].forEach((f, i) => { for (let k = 0; k < f.balls; k++) balls.push({ id: `bl${b}`, owner: i, spot: spots[b], color: f.ballColor || "#d8403a", k: k }), b++; });
  html.push(`<div id="stage"><div id="wall"></div><div id="tab"></div>${tex}
<svg style="position:absolute;left:0;top:0" width="${W}" height="${H}"><ellipse cx="${bowl.x}" cy="${bowl.y - 40}" rx="${bowl.rx}" ry="40" fill="#b99a64"/></svg>
${balls.map((q) => `<div class="fig" id="${q.id}w" style="opacity:0"><div id="${q.id}y"><div class="ball" style="background:${q.color}"></div></div></div>`).join("")}
<svg style="position:absolute;left:0;top:0" width="${W}" height="${H}"><path d="M ${bowl.x - bowl.rx} ${bowl.y - 40} A ${bowl.rx} ${bowl.ry + 40} 0 0 0 ${bowl.x + bowl.rx} ${bowl.y - 40} Z" fill="#efe2c6" stroke="#b99a64" stroke-width="5" stroke-dasharray="14 10"/></svg>
${fig("fa", A, startX[0])}${fig("fb", B, startX[1])}
<div id="banner"><span id="q">${A.balls} + ${B.balls} = ?</span><span id="ans">${A.balls} + ${B.balls} = ${total}</span></div>
${spots.map((s, k) => `<div class="cnt" id="c${k}" style="left:${s.x - 30}px;top:${s.y - 32}px;width:60px;text-align:center">${k + 1}</div>`).join("")}
</div>`);
  // boil: 1-degree wobble at 6 fps on each figure, all video long
  js.push(`tl.set("#q",{opacity:1},.2);tl.set("#fa",{x:${startX[0]},y:${table - 60}},0);tl.set("#fb",{x:${startX[1]},y:${table - 60}},0);`);
  js.push(balls.map((q) => `tl.set("#${q.id}w",{x:${startX[q.owner]},y:${table - 180}},0);`).join(""));
  let t = 0.8;
  const snaps = [];
  [A, B].forEach((f, i) => {
    const id = i ? "fb" : "fa";
    const dir = i ? -1 : 1;
    let x = startX[i];
    for (let k = 0; k < f.balls; k++) {
      // hop toward the bowl
      const nx = x + dir * 70;
      js.push(`tl.to("#${id}",{x:${nx},duration:.5,ease:"${st(0.5)}"},${r3(t)});`);
      js.push(`tl.to("#${id}h",{y:-70,duration:.25,ease:"${st(0.25)}"},${r3(t)});`);
      js.push(`tl.to("#${id}h",{y:0,duration:.25,ease:"${st(0.25)}"},${r3(t + 0.25)});`);
      sfx.push({ t: t + 0.5, kind: "thock" });
      x = nx;
      // toss a ball into the bowl
      const q = balls.find((z) => z.owner === i && z.k === k);
      const tt = t + 0.6;
      js.push(`tl.set("#${q.id}w",{x:${x + dir * 40},y:${table - 180},opacity:1},${r3(tt)});`);
      js.push(`tl.to("#${q.id}w",{x:${r3(q.spot.x)},y:${r3(q.spot.y)},duration:.75,ease:"${st(0.75)}"},${r3(tt)});`);
      js.push(`tl.to("#${q.id}y",{y:-220,duration:.33,ease:"${st(0.33)}"},${r3(tt)});`);
      js.push(`tl.to("#${q.id}y",{y:0,duration:.42,ease:"${st(0.42)}"},${r3(tt + 0.33)});`);
      sfx.push({ t: tt + 0.75, kind: "pop" });
      t = tt + 1.1; // hold, like a stop-motion beat
    }
    snaps.push(t - 0.3);
    t += 0.3;
  });
  // count and answer
  for (let k = 0; k < total; k++) {
    js.push(`tl.to("#c${k}",{opacity:1,duration:.08,ease:"steps(1)"},${r3(t + k * 0.42)});`);
    sfx.push({ t: t + k * 0.42, kind: "blip", p: k });
  }
  const ta = t + total * 0.42 + 0.3;
  js.push(`tl.set("#q",{opacity:0},${r3(ta)});tl.set("#ans",{opacity:1},${r3(ta)});`);
  js.push(`tl.fromTo("#banner",{rotation:0},{rotation:-3,duration:.25,ease:"steps(3)",yoyo:true,repeat:1},${r3(ta)});`);
  // both friends jump for joy
  js.push(`tl.to("#fab",{y:-90,duration:.25,ease:"steps(3)",yoyo:true,repeat:3},${r3(ta + 0.2)});`);
  js.push(`tl.to("#fbb",{y:-90,duration:.25,ease:"steps(3)",yoyo:true,repeat:3},${r3(ta + 0.32)});`);
  sfx.push({ t: ta, kind: "ding" });
  snaps.push(ta + 1.5);
  const D = ta + 2.6;
  // boil on both bodies (tiny rotation flip every 1/6 s, until the jumps)
  const boil = [];
  for (let s = 0; s < ta; s += 1 / 6) boil.push(`tl.set("#fab",{rotation:${(Math.round(s * 6) % 2 ? 1 : -1) * 0.8}},${r3(s)});tl.set("#fbb",{rotation:${(Math.round(s * 6) % 2 ? -1 : 1) * 0.8}},${r3(s)});`);
  js.push(boil.join(""));
  ctx.duration = r3(D);
  ctx.snapshots = [0.6, ...snaps];
}
