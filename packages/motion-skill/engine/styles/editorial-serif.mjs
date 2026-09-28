// editorial-serif: cream paper, heavy sans with an italic serif accent word,
// mono kicker labels, thin drawn connectors. The "launch film" look of the
// Claude / Anthropic, LaunchRepo and TypeSafe videos, rebuilt for concept cards.
import { esc, rich, words, r3 } from "../lib.mjs";

export function build(spec, ctx) {
  const P = { paper: "#f3eee4", ink: "#1d1a16", accent: "#c4623f", muted: "#8b8378", rule: "#d9d1c3", ...(spec.palette || {}) };
  ctx.fonts.add("inter").add("serif").add("mono");
  ctx.duration = spec.duration;
  ctx.bpm = 0;
  const { css, html, js, sfx } = ctx;
  css.push(`
#stage{position:absolute;inset:0;background:${P.paper};color:${P.ink};font-family:Inter,sans-serif;transform-origin:50% 50%}
#grain{position:absolute;inset:0;opacity:.35;background-image:radial-gradient(${P.rule} 1px,transparent 1.2px);background-size:7px 7px}
.kicker{position:absolute;top:64px;left:96px;font:500 20px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:${P.muted}}
.folio{position:absolute;top:64px;right:96px;font:500 20px "Plex Mono";letter-spacing:.14em;color:${P.muted}}
.hr{position:absolute;left:96px;right:96px;top:108px;height:1px;background:${P.rule};transform-origin:0 50%}
.beat{position:absolute;inset:0}
.m{display:inline-block;overflow:hidden;vertical-align:bottom;padding:0 .04em .12em;margin-bottom:-.12em}
.m>span{display:inline-block}
.acc{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:${P.accent};letter-spacing:0;font-size:1.12em}
.h1{position:absolute;left:96px;right:160px;top:360px;font-weight:700;font-size:132px;line-height:1.02;letter-spacing:-.035em}
.lbl{font:500 20px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:${P.muted}}
.term{position:absolute;left:96px;top:330px;font:italic 400 190px/1 "Instrument Serif";color:${P.accent};letter-spacing:-.01em}
.card{position:absolute;left:880px;top:560px;width:900px;background:#fffdf8;border:1px solid ${P.rule};border-radius:20px;padding:40px 48px;box-shadow:0 30px 60px -30px rgba(60,40,20,.25)}
.card p{margin-top:18px;font-size:44px;line-height:1.22;letter-spacing:-.015em;font-weight:400}
.eq{position:absolute;left:0;right:0;top:420px;text-align:center;font:400 124px/1 "Instrument Serif";letter-spacing:-.01em;white-space:nowrap}
.eq .tk{display:inline-block;margin:0 .12em}
.card sub{font-size:.6em}.eq sub{font-size:.55em;vertical-align:-.25em}
.eqlbl{position:absolute;left:0;right:0;top:330px;text-align:center}
.eqnote{position:absolute;left:0;right:0;top:640px;text-align:center;font:400 34px Inter;color:${P.muted}}
.close{position:absolute;left:96px;right:96px;top:400px;font:700 150px/1.02 Inter;letter-spacing:-.04em}
.wm{position:absolute;left:96px;bottom:90px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:${P.muted}}
svg.wire{position:absolute;inset:0;overflow:visible}
`);
  html.push(`<div id="stage"><div id="grain"></div>
<div class="kicker">${esc(spec.kicker || "")}</div><div class="folio">${esc(spec.folio || "")}</div><div class="hr" id="hr"></div>`);
  js.push(`tl.fromTo("#hr",{scaleX:0},{scaleX:1,duration:.9,ease:"power3.inOut"},.1);`);
  js.push(`tl.fromTo("#stage",{scale:1},{scale:1.035,duration:${ctx.duration},ease:"none"},0);`);

  const beats = spec.beats;
  const snaps = [];
  // masked word rise: every word slides up out of its own clip box
  const rise = (ws, at, gap = 0.07) =>
    ws.forEach((w, k) => {
      js.push(`tl.fromTo("#${w.id}",{yPercent:110},{yPercent:0,duration:.55,ease:"power4.out"},${r3(at + k * gap)});`);
      sfx.push({ t: at + k * gap, kind: "tick", p: k });
    });
  const masked = (ws) => ws.map((w) => `<span class="m">${w.html}</span>`).join(" ");

  beats.forEach((b, i) => {
    const end = beats[i + 1]?.at ?? ctx.duration;
    const id = `b${i}`;
    let inner = "";
    if (b.type === "headline") {
      const ws = words(b.text, `${id}w`);
      inner = `<div class="h1">${masked(ws)}</div>`;
      rise(ws, b.at + 0.15);
      snaps.push(b.at + 0.15 + ws.length * 0.07 + 0.8);
    } else if (b.type === "definition") {
      const ws = words(b.text, `${id}w`);
      inner =
        `<div class="term" id="${id}t">${esc(b.term)}</div>` +
        `<svg class="wire" width="1920" height="1080"><path id="${id}p" d="M ${b.fromX || 560} 540 C 700 560, 760 640, 870 660" pathLength="1" fill="none" stroke="${P.ink}" stroke-width="2" stroke-dasharray="1" stroke-dashoffset="1"/><circle id="${id}c" cx="${b.fromX || 560}" cy="540" r="7" fill="${P.accent}"/></svg>` +
        `<div class="card" id="${id}k"><div class="lbl">${esc(b.label || "definición")}</div><p>${masked(ws)}</p></div>`;
      js.push(`tl.fromTo("#${id}t",{opacity:0,y:40},{opacity:1,y:0,duration:.7,ease:"power3.out"},${r3(b.at + 0.1)});`);
      js.push(`tl.fromTo("#${id}c",{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.3,ease:"back.out(3)"},${r3(b.at + 0.6)});`);
      js.push(`tl.to("#${id}p",{strokeDashoffset:0,duration:.6,ease:"power2.inOut"},${r3(b.at + 0.65)});`);
      js.push(`tl.fromTo("#${id}k",{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},${r3(b.at + 1.1)});`);
      rise(ws, b.at + 1.3, 0.05);
      sfx.push({ t: b.at + 0.6, kind: "pop" }, { t: b.at + 1.1, kind: "whoosh" });
      snaps.push(b.at + 1.3 + ws.length * 0.05 + 0.8);
    } else if (b.type === "equation") {
      const toks = b.text.split(/\s+/);
      inner =
        `<div class="eqlbl lbl" id="${id}l">${esc(b.label || "")}</div>` +
        `<div class="eq">${toks.map((t, k) => `<span class="tk" id="${id}e${k}">${rich(t)}</span>`).join("")}</div>` +
        `<svg class="wire" width="1920" height="1080"><path id="${id}u" d="M 520 600 C 800 585, 1100 590, 1400 598" pathLength="1" fill="none" stroke="${P.accent}" stroke-width="10" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>` +
        `<div class="eqnote" id="${id}n">${esc(b.note || "")}</div>`;
      js.push(`tl.fromTo("#${id}l",{opacity:0},{opacity:1,duration:.4},${r3(b.at + 0.1)});`);
      toks.forEach((t, k) => {
        js.push(`tl.fromTo("#${id}e${k}",{opacity:0,y:30,filter:"blur(8px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.45,ease:"power3.out"},${r3(b.at + 0.3 + k * 0.16)});`);
        sfx.push({ t: b.at + 0.3 + k * 0.16, kind: "tick" });
      });
      const u = b.at + 0.5 + toks.length * 0.16;
      js.push(`tl.to("#${id}u",{strokeDashoffset:0,duration:.7,ease:"power2.inOut"},${r3(u)});`);
      js.push(`tl.fromTo("#${id}n",{opacity:0,y:10},{opacity:1,y:0,duration:.5},${r3(u + 0.5)});`);
      sfx.push({ t: u, kind: "scribble", len: 0.6 });
      snaps.push(u + 1.2);
    } else if (b.type === "closing") {
      const ws = words(b.text, `${id}w`);
      inner = `<div class="close">${masked(ws)}</div><div class="wm" id="${id}m">${esc(spec.brand || "")}</div>`;
      rise(ws, b.at + 0.15, 0.09);
      js.push(`tl.fromTo("#${id}m",{opacity:0},{opacity:1,duration:.5},${r3(b.at + 0.9)});`);
      sfx.push({ t: b.at + 0.9, kind: "ding" });
      snaps.push(Math.min(end - 0.2, b.at + 2));
    }
    html.push(`<div class="beat" id="${id}">${inner}</div>`);
    // exit: the page lifts away just before the next beat
    if (i < beats.length - 1) js.push(`tl.to("#${id}",{y:-60,opacity:0,duration:.35,ease:"power2.in"},${r3(end - 0.35)});`);
  });
  html.push(`</div>`);
  ctx.snapshots = snaps;
}
