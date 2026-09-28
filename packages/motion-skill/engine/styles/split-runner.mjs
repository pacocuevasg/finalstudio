// split-runner: the "explainer + endless runner" split screen (goodside's
// Black-Scholes + Subway Surfers knockoff). One half teaches, the other half
// plays a procedural runner so the eye never leaves, with big karaoke captions
// over the seam. Everything in the game is our own geometry, generated from a
// seeded schedule: no game assets, no likeness of any real game.
// layout "landscape" = lesson right / game left (1920×1080);
// layout "vertical"  = lesson top / game bottom (1080×1920, for Reels/TikTok).
import { esc, rich, r3, rng, assertFact, odometerCss } from "../lib.mjs";

function checkLine(txt) {
  if (!txt.includes("=")) return 0;
  const js = txt.replace(/√\(?(\d+(?:\.\d+)?)\)?/g, "Math.sqrt($1)").replace(/\^(\d+)/g, "**$1").replace(/²/g, "**2").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  const sides = js.split("=").map((s) => s.trim()).filter((s) => /^[\d\s.+\-*/()]+$|Math\.sqrt/.test(s) && !/[a-z](?!ath|qrt)/i.test(s.replace(/Math\.sqrt/g, "")));
  if (sides.length < 2) return 0;
  const v = sides.map((s) => Function(`return (${s})`)());
  for (let i = 1; i < v.length; i++) assertFact(Math.abs(v[i] - v[0]) < 1e-9, `"${txt}" (${v[0]} ≠ ${v[i]})`);
  return 1;
}

export function build(spec, ctx) {
  const vertical = spec.layout === "vertical";
  if (vertical) { ctx.W = 1080; ctx.H = 1920; spec.width = 1080; spec.height = 1920; }
  const W = vertical ? 1080 : 1920, H = vertical ? 1920 : 1080;
  const G = vertical ? { x: 0, y: 960, w: 1080, h: 960 } : { x: 0, y: 0, w: 960, h: 1080 }; // game rect
  const Ls = vertical ? { x: 0, y: 0, w: 1080, h: 960 } : { x: 960, y: 0, w: 960, h: 1080 }; // lesson rect
  const P = { sky1: "#7fd3ff", sky2: "#c9f0ff", hill: "#6cc58a", hill2: "#4aa46b", ground: "#3b3355", lane: "#51477a", hero: "#ff5a36", box: "#ffc93c", coin: "#ffe066", paper: "#fbf8f2", ink: "#1c1b22", accent: "#ff5a36", ...(spec.palette || {}) };
  ctx.fonts.add("inter").add("serif").add("mono");
  const DUR = spec.duration;
  ctx.duration = DUR;
  const { css, html, js, sfx } = ctx;
  const R = rng(spec.seed || 42);

  // ---------------- game ----------------
  const groundY = G.h * 0.74; // top of ground in game-local px
  const heroX = G.w * 0.26;
  const speed = G.w * 0.62; // px per second the world scrolls
  const tile = 240;
  css.push(`
#game{position:absolute;left:${G.x}px;top:${G.y}px;width:${G.w}px;height:${G.h}px;overflow:hidden;background:linear-gradient(${P.sky1},${P.sky2} 70%)}
.strip{position:absolute;left:0;display:flex}
.hills i{display:block;flex:none;width:480px;height:260px;border-radius:240px 240px 0 0}
#ground{position:absolute;left:0;top:${r3(groundY)}px;width:${G.w + tile * 2}px;height:${r3(G.h - groundY)}px;background:${P.ground}}
#lanes{position:absolute;left:0;top:${r3(groundY + 34)}px;display:flex}
#lanes i{display:block;flex:none;width:${tile / 2}px;height:14px;margin-right:${tile / 2}px;border-radius:7px;background:${P.lane}}
#hero{position:absolute;left:${r3(heroX - 55)}px;top:${r3(groundY - 120)}px;width:110px;height:120px}
#heroB{position:absolute;inset:0}
.body{position:absolute;left:5px;top:0;width:100px;height:96px;border-radius:48px 48px 40px 40px;background:${P.hero};box-shadow:inset -10px -8px 0 rgba(0,0,0,.15)}
.eye{position:absolute;left:58px;top:26px;width:26px;height:30px;border-radius:50%;background:#fff}.eye b{position:absolute;right:3px;top:8px;width:12px;height:14px;border-radius:50%;background:${P.ink}}
.leg{position:absolute;top:86px;width:22px;height:34px;border-radius:11px;background:${P.ink};transform-origin:50% 0}
.obs{position:absolute;top:${r3(groundY - 90)}px;left:0;width:90px;height:90px;border-radius:12px;background:${P.box};box-shadow:inset -10px -10px 0 rgba(0,0,0,.12);border:5px solid ${P.ink}}
.coin{position:absolute;left:0;width:48px;height:48px;border-radius:50%;background:${P.coin};border:5px solid #d4a514}
#score{position:absolute;right:28px;top:26px;background:rgba(0,0,0,.35);color:#fff;border-radius:40px;padding:10px 26px;font:700 44px Inter;display:flex;gap:12px;align-items:center}
#score .odo-win{height:52px;overflow:hidden;display:inline-block}#score .odo-strip{display:flex;flex-direction:column}#score .odo-strip i{font-style:normal;height:52px;line-height:52px}
`);
  const hills = (n, color, h, top) =>
    `<div class="strip hills" style="top:${top}px">${Array.from({ length: n }, (_, k) => `<i style="background:${color};height:${h + ((k * 37) % 60)}px;margin-top:${260 - h - ((k * 37) % 60)}px;margin-right:${40 + ((k * 53) % 80)}px"></i>`).join("")}</div>`;
  // two parallax layers, each a strip twice as wide that loops by exactly one period
  const period1 = 4 * (480 + 80), period2 = 3 * (480 + 60);
  const far = hills(10, P.hill2, 180, r3(groundY - 250));
  const near = hills(8, P.hill, 140, r3(groundY - 220));

  // obstacle schedule: a jump every ~1.1–1.8 s, seeded, never in the first second
  const obstacles = [];
  let tt = 1.2;
  while (tt < DUR - 0.8) {
    obstacles.push({ t: r3(tt), coin: R() > 0.35 });
    tt += 1.1 + R() * 0.7;
  }
  const coins = obstacles.filter((o) => o.coin).length;
  const obsHtml = obstacles
    .map((o, k) => `<div class="obs" id="ob${k}"></div>${o.coin ? `<div class="coin" id="co${k}" style="top:${r3(groundY - 250)}px"></div>` : ""}`)
    .join("");
  const scoreStrip = Array.from({ length: coins + 1 }, (_, i) => `<i>${i}</i>`).join("");
  html.push(`<div id="game">
<div id="far">${far}</div><div id="near">${near}</div>
<div id="ground"></div><div id="lanes">${"<i></i>".repeat(Math.ceil((G.w + tile * 2) / tile))}</div>
${obsHtml}
<div id="hero"><div id="heroB"><i class="leg" id="lg1" style="left:26px"></i><i class="leg" id="lg2" style="left:62px"></i><div class="body"></div><div class="eye"><b></b></div></div></div>
<div id="score"><span style="font-size:36px">●</span><span class="odo-win"><span class="odo-strip" id="sc">${scoreStrip}</span></span></div>
</div>`);
  // world scroll (looping, seek-safe)
  js.push(`tl.fromTo("#far .strip",{x:0},{x:-${period1},duration:${r3(period1 / (speed * 0.25))},ease:"none",repeat:${Math.ceil(DUR / (period1 / (speed * 0.25)))}},0);`);
  js.push(`tl.fromTo("#near .strip",{x:0},{x:-${period2},duration:${r3(period2 / (speed * 0.5))},ease:"none",repeat:${Math.ceil(DUR / (period2 / (speed * 0.5)))}},0);`);
  js.push(`tl.fromTo("#lanes",{x:0},{x:-${tile},duration:${r3(tile / speed)},ease:"none",repeat:${Math.ceil(DUR / (tile / speed))}},0);`);
  // run cycle
  js.push(`tl.fromTo("#lg1",{rotation:-28},{rotation:28,duration:.16,ease:"sine.inOut",yoyo:true,repeat:${Math.ceil(DUR / 0.16)}},0);`);
  js.push(`tl.fromTo("#lg2",{rotation:28},{rotation:-28,duration:.16,ease:"sine.inOut",yoyo:true,repeat:${Math.ceil(DUR / 0.16)}},0);`);
  js.push(`tl.fromTo("#heroB",{y:0},{y:-6,duration:.16,ease:"sine.inOut",yoyo:true,repeat:${Math.ceil(DUR / 0.16)}},0);`);
  // obstacles slide in and the hero jumps each one at the right moment
  let scoreN = 0;
  obstacles.forEach((o, k) => {
    const x0 = G.w + 20, x1 = -120;
    const tPass = o.t; // obstacle centre reaches the hero
    const t0 = tPass - (x0 - heroX + 45) / speed;
    const dur = (x0 - x1) / speed;
    js.push(`tl.fromTo("#ob${k}",{x:${r3(x0)}},{x:${r3(x1)},duration:${r3(dur)},ease:"none"},${r3(t0)});`);
    if (o.coin) {
      js.push(`tl.fromTo("#co${k}",{x:${r3(x0 + 21)}},{x:${r3(x1 + 21)},duration:${r3(dur)},ease:"none"},${r3(t0)});`);
      js.push(`tl.set("#co${k}",{opacity:0},${r3(tPass)});`);
      scoreN++;
      js.push(`tl.set("#sc",{y:${-52 * scoreN}},${r3(tPass)});`);
      sfx.push({ t: tPass, kind: "coin" });
    }
    const up = 0.3;
    js.push(`tl.to("#hero",{y:-200,duration:${up - 0.02},ease:"power2.out"},${r3(tPass - up)});`);
    js.push(`tl.to("#hero",{y:0,duration:${up},ease:"power2.in"},${r3(tPass)});`);
    sfx.push({ t: tPass - up, kind: "jump" });
  });

  // ---------------- lesson ----------------
  const pad = vertical ? 80 : 90;
  css.push(`
#lesson{position:absolute;left:${Ls.x}px;top:${Ls.y}px;width:${Ls.w}px;height:${Ls.h}px;background:${P.paper};color:${P.ink};overflow:hidden;font-family:Inter,sans-serif}
#lesson .kick{position:absolute;left:${pad}px;top:${pad - 20}px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#8f8a80}
#lesson .ttl{position:absolute;left:${pad}px;top:${pad + 20}px;font:italic 400 76px/1 "Instrument Serif"}
#tri{position:absolute;left:${vertical ? 620 : pad}px;top:${vertical ? 230 : 250}px;width:340px;height:300px;overflow:visible}
.eqs{position:absolute;left:${vertical ? pad : pad}px;top:${vertical ? 250 : 560}px;font:700 ${vertical ? 64 : 58}px/1.35 Inter;letter-spacing:-.02em}
.eq{opacity:0;position:relative;white-space:nowrap}
.eq sup{font-size:.55em}
.eq.ans{display:inline-block;background:${P.ink};color:${P.paper};padding:0 .3em;border-radius:.2em;margin-left:-.3em}
`);
  const [a, b] = spec.triangle || [3, 4];
  const s = 60; // px per unit
  const tri = `<svg id="tri" viewBox="-40 -20 ${a * s + 120} ${b * s + 80}"><path id="trp" d="M0 ${b * s} H${a * s} V0 Z" pathLength="1" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/><path d="M${a * s - 30} ${b * s} V${b * s - 30} H${a * s}" fill="none" stroke="${P.ink}" stroke-width="4"/>
<text id="ta" x="${(a * s) / 2}" y="${b * s + 52}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="44" fill="${P.accent}" opacity="0">${a}</text>
<text id="tb" x="${a * s + 18}" y="${(b * s) / 2 + 14}" font-family="Inter" font-weight="700" font-size="44" fill="${P.accent}" opacity="0">${b}</text>
<text id="tc" x="${(a * s) / 2 - 44}" y="${(b * s) / 2 - 8}" font-family="Inter" font-weight="700" font-size="44" fill="${P.ink}" opacity="0">c</text></svg>`;
  let checked = 0;
  const eqs = spec.lines.map((ln, k) => {
    checked += checkLine(ln.check || ln.text);
    return `<div class="eq${ln.answer ? " ans" : ""}" id="eq${k}">${rich(ln.text).replace(/\^(\d+)/g, "<sup>$1</sup>")}</div>`;
  });
  if (checked) console.log(`✓ lesson check: ${checked} line(s) hold`);
  html.push(`<div id="lesson"><div class="kick">${esc(spec.kicker || "")}</div><div class="ttl" id="ttl">${esc(spec.title)}</div>${tri}<div class="eqs">${eqs.join("")}</div></div>`);
  js.push(`tl.fromTo("#ttl",{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:"power3.out"},.2);`);
  js.push(`tl.to("#trp",{strokeDashoffset:0,duration:1,ease:"power2.inOut"},.5);`);
  ["ta", "tb", "tc"].forEach((id, k) => js.push(`tl.to("#${id}",{opacity:1,duration:.2},${r3(1.3 + k * 0.25)});`));
  spec.lines.forEach((ln, k) => {
    js.push(`tl.fromTo("#eq${k}",{opacity:0,x:-30},{opacity:1,x:0,duration:.45,ease:"power3.out"},${r3(ln.at)});`);
    if (k > 0 && !spec.lines[k - 1].answer) js.push(`tl.to("#eq${k - 1}",{opacity:.35,duration:.3},${r3(ln.at)});`);
    sfx.push({ t: ln.at, kind: ln.answer ? "ding" : "pop" });
  });

  // ---------------- karaoke captions over the seam ----------------
  css.push(`
.cap{position:absolute;${vertical ? "left:0;right:0;top:860px" : `left:0;width:${G.w}px;bottom:70px`};text-align:center;font:900 ${vertical ? 76 : 64}px/1.12 Inter;letter-spacing:-.01em;opacity:0;z-index:10;padding:0 50px}
.cap .l{position:absolute;inset:0;padding:0 50px}
.cap .stk{color:${P.ink};-webkit-text-stroke:14px ${P.ink}}
.cap .fil{color:#fff;position:relative}
.cap span{display:inline-block;margin:0 .05em}
`);
  (spec.say || []).forEach((c, i) => {
    const end = spec.say[i + 1]?.at ?? DUR;
    const ws = c.text.split(/\s+/);
    const layer = (cls, pre) => `<div class="${cls}">${ws.map((w, k) => `<span id="${pre}${i}_${k}">${esc(w)}</span>`).join(" ")}</div>`;
    html.push(`<div class="cap" id="cp${i}">${layer("l stk", "cs")}${layer("fil", "cw")}</div>`);
    js.push(`tl.set("#cp${i}",{opacity:1},${r3(c.at)});`);
    js.push(`tl.set("#cp${i}",{opacity:0},${r3(end)});`);
    const per = Math.min(0.32, (end - c.at - 0.2) / ws.length);
    ws.forEach((_, k) => {
      const at = c.at + k * per;
      js.push(`tl.set("#cw${i}_${k}",{color:"${P.coin}"},${r3(at)});`);
      if (k > 0) js.push(`tl.set("#cw${i}_${k - 1}",{color:"#fff"},${r3(at)});`);
      js.push(`tl.fromTo("#cw${i}_${k}, #cs${i}_${k}",{scale:1.2},{scale:1,duration:.18,ease:"back.out(3)",immediateRender:false},${r3(at)});`);
    });
  });
  css.push(odometerCss(52));
  ctx.snapshots = [1.6, ...spec.lines.map((l) => l.at + 0.6)];
}
