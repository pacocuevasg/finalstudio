// retro-window: off-white paper with pink halftone clouds, black-framed retro
// windows that pop in one per fact, mono data, and a big cost counter that
// rolls at the end. A data variant that shares FinalStudio's halftone look.
// Facts: every derived number (energy, cost) is computed from the inputs.
import { esc, r3, odometer, odometerCss, assertFact } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("inter").add("mono").add("pixel");
  const P = { paper: "#f6f3ee", ink: "#111", pink: "#ff5fa2", ...(spec.palette || {}) };
  const I = spec.inputs; // { wh, perDay, days, price }
  const kwh = (I.wh * I.perDay * I.days) / 1000;
  const cost = kwh * I.price;
  assertFact(kwh > 0 && cost > 0, "inputs must give a positive energy and cost");
  const fmt = (n, d) => n.toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
  const vals = { wh: fmt(I.wh, 0), charges: fmt(I.perDay * I.days, 0), kwh: fmt(kwh, 2), price: fmt(I.price, 2), cost: fmt(cost, 2) };
  console.log(`✓ ${I.wh} Wh × ${I.perDay * I.days} = ${vals.kwh} kWh × $${vals.price} = $${vals.cost}`);
  const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vals[k] ?? `{${k}}`);
  const LH = 190;
  css.push(`
#stage{position:absolute;inset:0;background:${P.paper};font-family:Inter,sans-serif;color:${P.ink};overflow:hidden}
.ht{position:absolute;border-radius:50%;background-image:radial-gradient(${P.pink} 38%,transparent 40%);background-size:14px 14px;-webkit-mask-image:radial-gradient(circle,#000 20%,transparent 70%);mask-image:radial-gradient(circle,#000 20%,transparent 70%)}
.win{position:absolute;background:#fff;border:4px solid ${P.ink};box-shadow:10px 10px 0 ${P.ink};opacity:0}
.bar{height:44px;border-bottom:4px solid ${P.ink};display:flex;align-items:center;gap:10px;padding:0 12px;background:repeating-linear-gradient(0deg,${P.ink} 0 3px,#fff 3px 7px)}
.bar b{background:#fff;padding:0 12px;font:400 16px "Press Start 2P";line-height:30px}
.bar i{width:26px;height:26px;border:4px solid ${P.ink};background:#fff;margin-left:auto}
.bd{padding:26px 30px}
.k{font:500 22px "Plex Mono";letter-spacing:.1em;text-transform:uppercase;opacity:.6}
.v{font:500 64px "Plex Mono";letter-spacing:-.02em;margin-top:8px}
.v small{font-size:28px;opacity:.6;margin-left:10px}
#big .v{font:900 ${LH}px/1 Inter;letter-spacing:-.05em;display:flex;align-items:flex-start}
#big .v .cur{font-size:.6em;margin-top:.08em;margin-right:.05em}
#big .v .u{font:500 34px "Plex Mono";letter-spacing:0;align-self:flex-end;margin:0 0 30px 20px;opacity:.7}
.ttl{position:absolute;left:96px;top:70px;font:400 26px "Press Start 2P";line-height:1.5}
.ttl span{background:${P.ink};color:${P.paper};padding:4px 12px}
${odometerCss(LH)}
`);
  const wins = spec.windows.map((w, k) => ({ ...w, id: `w${k}` }));
  const od = odometer("cost", vals.cost, { turns: 2, lineHeight: LH });
  html.push(`<div id="stage">
<div class="ht" id="h0" style="left:-160px;top:520px;width:760px;height:760px"></div>
<div class="ht" id="h1" style="left:1340px;top:-220px;width:820px;height:820px"></div>
<div class="ht" id="h2" style="left:1180px;top:760px;width:520px;height:520px"></div>
<div class="ttl"><span>${esc(spec.title)}</span></div>
${wins.map((w) => `<div class="win" id="${w.id}" style="left:${w.x}px;top:${w.y}px;width:${w.w || 520}px"><div class="bar"><b>${esc(w.bar || "DATO")}</b><i></i></div><div class="bd"><div class="k">${esc(w.label)}</div><div class="v">${esc(fill(w.value))}${w.unit ? `<small>${esc(w.unit)}</small>` : ""}</div></div></div>`).join("")}
<div class="win" id="big" style="left:${spec.big?.x ?? 560}px;top:${spec.big?.y ?? 520}px;width:${spec.big?.w ?? 900}px"><div class="bar"><b>${esc(spec.big?.bar || "TOTAL")}</b><i></i></div><div class="bd"><div class="k">${esc(spec.big?.label || "")}</div><div class="v"><span class="cur">$</span>${od.html}<span class="u">${esc(spec.big?.unit || "")}</span></div></div></div>
</div>`);
  js.push(`tl.to("#h0",{x:60,y:-40,duration:12,ease:"sine.inOut"},0);`);
  js.push(`tl.to("#h1",{x:-80,y:60,duration:12,ease:"sine.inOut"},0);`);
  js.push(`tl.to("#h2",{x:-50,y:-70,duration:12,ease:"sine.inOut"},0);`);
  const gap = spec.gap || 1.3;
  let t = 0.5;
  const snaps = [];
  wins.forEach((w, k) => {
    // pop: stepped scale, like an old window manager
    js.push(`tl.set("#${w.id}",{opacity:1},${r3(t)});`);
    js.push(`tl.fromTo("#${w.id}",{scale:.2},{scale:1,duration:.24,ease:"steps(4)"},${r3(t)});`);
    sfx.push({ t, kind: "blip", p: k });
    t += gap;
  });
  snaps.push(t - 0.2);
  js.push(`tl.set("#big",{opacity:1},${r3(t)});`);
  js.push(`tl.fromTo("#big",{scale:.2},{scale:1,duration:.3,ease:"steps(5)"},${r3(t)});`);
  sfx.push({ t, kind: "blip", p: 6 });
  js.push(od.js(t + 0.3, 0.8));
  for (let k = 0; k < 8; k++) sfx.push({ t: t + 0.3 + k * 0.09, kind: "tick" });
  sfx.push({ t: t + 1.15, kind: "coin" });
  snaps.push(t + 2);
  ctx.duration = r3(t + 3.2);
  ctx.snapshots = [1.8, ...snaps];
}
