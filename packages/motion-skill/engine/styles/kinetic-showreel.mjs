// kinetic-showreel: the "show me what an incredible motion designer you are"
// look that dominated Opus 5.5 week (himanshutwtxs, ajith_io, aichrislee):
// hard cuts on the beat, light/dark flips, giant condensed words, a live
// easing curve, a bouncing ball with onion skin, a counter and a lockup.
// Use it as a 6–12 s hook, intro or outro.
import { esc, r3, rich, odometer, odometerCss } from "../lib.mjs";

const bounceOut = (t) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};
const power4Out = (t) => 1 - Math.pow(1 - t, 5);

export function build(spec, ctx) {
  const P = { a: "#f2efe8", b: "#111111", accent: "#ff4a1c", ...(spec.palette || {}) };
  const bg = (k) => P[k] || k;
  const fg = (k) => (k === "a" ? P.b : k === "b" ? P.a : "#fff");
  ctx.fonts.add("condensed").add("mono").add("hand").add("serif");
  const bpm = spec.bpm || 120;
  const beat = 60 / bpm;
  ctx.bpm = bpm;
  ctx.bed = 0;
  const { css, html, js, sfx } = ctx;
  css.push(`
.shot{position:absolute;inset:0;visibility:hidden;overflow:hidden}
.slam{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:.18em;font-family:Anton,sans-serif;text-transform:uppercase;line-height:.86;letter-spacing:-.01em;white-space:nowrap}
.slam span{display:inline-block}
.mono{font:500 22px "Plex Mono";letter-spacing:.12em;text-transform:uppercase}
.corner{position:absolute;top:48px;left:60px}.corner2{position:absolute;bottom:48px;right:60px}
.hand{font:700 64px Caveat}
.lock{position:absolute;left:0;right:0;top:330px;text-align:center}
.lock .t{font:400 300px/.9 Anton;text-transform:uppercase;letter-spacing:-.01em;display:inline-block}
.lock .s{font:italic 400 110px/1 "Instrument Serif";display:block;margin-top:10px}
.bar{position:absolute;left:0;right:0;height:26px;top:700px;transform-origin:0 50%}
.cnt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:40px;font-family:Anton}
.cnt .num{font-size:520px}
.cnt .suf{font:italic 400 150px "Instrument Serif";align-self:flex-end;margin-bottom:170px}
${odometerCss(460)}
.cnt .odo{height:460px;line-height:460px}
.dots{position:absolute;left:210px;top:170px;display:grid;grid-template-columns:repeat(16,1fr);gap:46px 46px;width:1500px}
.dots i{display:block;width:30px;height:30px;border-radius:50%}
`);
  let t = 0;
  const snaps = [];
  spec.shots.forEach((s, i) => {
    const len = (s.beats || 2) * beat;
    const id = `s${i}`;
    const B = bg(s.bg || (i % 2 ? "a" : "b"));
    const F = s.fg || fg(s.bg || (i % 2 ? "a" : "b"));
    let inner = `<div class="mono corner" style="color:${F};opacity:.55">${String(i + 1).padStart(2, "0")} — ${esc(s.tag || s.type)}</div><div class="mono corner2" style="color:${F};opacity:.55">${esc(spec.brand || "")}</div>`;
    if (s.type === "slam") {
      const chars = s.words.join(" ").length;
      const size = Math.min(620, Math.floor(1750 / (chars * 0.5 + 0.4)));
      inner += `<div class="slam" style="font-size:${size}px;color:${F}">${s.words.map((w, k) => `<span id="${id}w${k}"${s.accent === k ? ` style="color:${P.accent}"` : ""}>${rich(w)}</span>`).join("")}</div>`;
      s.words.forEach((_, k) => {
        const at = t + k * Math.min(0.12, len / 6);
        js.push(`tl.fromTo("#${id}w${k}",{scale:1.35,y:40,filter:"blur(14px)",opacity:0},{scale:1,y:0,filter:"blur(0px)",opacity:1,duration:.32,ease:"expo.out"},${r3(at)});`);
      });
      js.push(`tl.to("#${id} .slam",{scale:1.06,duration:${r3(len)},ease:"none"},${r3(t)});`);
    } else if (s.type === "curve") {
      const pts = Array.from({ length: 61 }, (_, k) => {
        const x = k / 60;
        return `${r3(560 + x * 800)},${r3(860 - power4Out(x) * 640)}`;
      });
      inner +=
        `<svg class="abs" width="1920" height="1080" style="left:0;top:0"><path d="M560 220 V860 H1360" stroke="${F}" stroke-opacity=".25" stroke-width="3" fill="none"/>` +
        `<polyline id="${id}c" points="${pts.join(" ")}" pathLength="1" stroke="${P.accent}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>` +
        `<div class="abs" id="${id}dx" style="left:545px;top:845px;width:30px;height:30px"><div id="${id}dy" style="width:30px;height:30px;border-radius:50%;background:${F}"></div></div>` +
        `<div class="mono abs" style="left:560px;top:900px;color:${F}">${esc(s.label || "power4.out")}</div>` +
        `<div class="hand abs" style="left:1100px;top:250px;color:${F};transform:rotate(-4deg)">${esc(s.note || "rápido → suave")}</div>`;
      const d = len * 0.8;
      js.push(`tl.to("#${id}c",{strokeDashoffset:0,duration:${r3(d)},ease:"none"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}dx",{x:0},{x:800,duration:${r3(d)},ease:"none"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}dy",{y:0},{y:-640,duration:${r3(d)},ease:"power4.out"},${r3(t)});`);
    } else if (s.type === "ball") {
      const ghosts = Array.from({ length: 26 }, (_, k) => {
        const u = k / 25;
        return `<i style="position:absolute;left:${r3(300 + u * 1200)}px;top:${r3(180 + bounceOut(u) * 600)}px;width:90px;height:90px;border-radius:50%;border:3px solid ${F};opacity:${r3(0.05 + 0.14 * u)}"></i>`;
      }).join("");
      inner +=
        `<div class="abs" style="left:0;top:0;width:1920px;height:1080px" id="${id}g">${ghosts}</div>` +
        `<div class="abs" style="left:0;right:0;top:872px;height:3px;background:${F};opacity:.3"></div>` +
        `<div class="abs" id="${id}bx" style="left:300px;top:180px"><div id="${id}by" style="width:90px;height:90px;border-radius:50%;background:${P.accent}"></div></div>` +
        `<div class="hand abs" id="${id}n" style="left:760px;top:110px;color:${F};transform:rotate(-3deg)">${esc(s.note || "squash & stretch")}</div>`;
      const d = len * 0.9;
      js.push(`tl.fromTo("#${id}g",{opacity:0},{opacity:1,duration:${r3(d)},ease:"none"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}bx",{x:0},{x:1200,duration:${r3(d)},ease:"none"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}by",{y:0},{y:600,duration:${r3(d)},ease:"bounce.out"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}n",{opacity:0,y:10},{opacity:1,y:0,duration:.2},${r3(t + 0.15)});`);
      [0.3636, 0.7273, 0.9091].forEach((u) => sfx.push({ t: t + u * d, kind: "thock" }));
    } else if (s.type === "count") {
      const o = odometer(`${id}o`, s.value, { turns: 2, lineHeight: 460 });
      inner += `<div class="cnt" style="color:${F}"><div class="num">${o.html}</div><div class="suf">${esc(s.suffix || "")}</div></div>`;
      js.push(o.js(t, len * 0.8));
      sfx.push({ t: t + len * 0.8, kind: "ding" });
    } else if (s.type === "grid") {
      inner += `<div class="dots" id="${id}d">${Array.from({ length: 16 * 8 }, () => `<i style="background:${F}"></i>`).join("")}</div>`;
      js.push(`tl.fromTo("#${id}d i",{scale:0},{scale:1,duration:.3,ease:"back.out(3)",stagger:{grid:[8,16],from:"center",amount:${r3(len * 0.45)}}},${r3(t)});`);
      js.push(`tl.to("#${id}d i",{scale:.35,duration:.25,ease:"power2.in",stagger:{grid:[8,16],from:"edges",amount:${r3(len * 0.3)}}},${r3(t + len * 0.55)});`);
    } else if (s.type === "lockup") {
      inner += `<div class="lock" style="color:${F}"><span class="t" id="${id}t">${esc(s.title)}</span><span class="s" id="${id}s" style="color:${P.accent}">${esc(s.sub || "")}</span></div><div class="bar" id="${id}b" style="background:${P.accent};top:960px"></div>`; // clear of the brand label in the corner
      js.push(`tl.fromTo("#${id}t",{scale:.6,opacity:0},{scale:1,opacity:1,duration:.5,ease:"expo.out"},${r3(t)});`);
      js.push(`tl.fromTo("#${id}s",{opacity:0,y:30},{opacity:1,y:0,duration:.45,ease:"power3.out"},${r3(t + 0.25)});`);
      js.push(`tl.fromTo("#${id}b",{scaleX:0},{scaleX:1,duration:${r3(len * 0.7)},ease:"power2.inOut"},${r3(t + 0.2)});`);
      sfx.push({ t: t + 0.25, kind: "ding" });
    }
    html.push(`<div class="shot" id="${id}" style="background:${B};color:${F}">${inner}</div>`);
    // hard cut: visible exactly for its beats
    js.push(`tl.set("#${id}",{visibility:"visible"},${r3(t)});`);
    if (i < spec.shots.length - 1) js.push(`tl.set("#${id}",{visibility:"hidden"},${r3(t + len)});`);
    sfx.push({ t, kind: "kick" }, { t: t + beat, kind: s.type === "slam" ? "snare" : "tick" });
    snaps.push(t + len * 0.75);
    t += len;
  });
  ctx.duration = r3(t);
  ctx.snapshots = snaps;
}
