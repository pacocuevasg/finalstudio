// data-counter: a spreadsheet told as three or four stat shots. Flat colour
// fields that flip on hard cuts, rolling odometer numbers, bars that rise and a
// ring that fills (the Email.lab / X Money / ChatGPT finance look).
// Every number on screen is computed here from spec.data, never typed by hand.
import { esc, r3, odometer, odometerCss } from "../lib.mjs";

const fmt = (n, locale) => Math.round(n).toLocaleString(locale);

export function build(spec, ctx) {
  const P = { paper: "#f4f2ee", ink: "#141414", c1: "#5b3df5", c2: "#0f1d4a", accent: "#ff7a1a", ...(spec.palette || {}) };
  const L = spec.locale || "es-MX";
  const unit = spec.unit || "";
  ctx.fonts.add("inter").add("mono").add("serif");
  const { css, html, js, sfx } = ctx;
  const data = spec.data;
  const total = data.reduce((a, d) => a + d.value, 0);
  const max = Math.max(...data.map((d) => d.value));
  const last = data[data.length - 1], prev = data[data.length - 2];
  const delta = prev ? Math.round(((last.value - prev.value) / prev.value) * 100) : 0;
  const pct = spec.goal ? Math.round((total / spec.goal) * 100) : null;
  console.log(`✓ computed: total ${fmt(total, L)} · ${last.label} ${delta >= 0 ? "+" : ""}${delta}% vs ${prev?.label}${pct != null ? ` · ${pct}% de la meta` : ""}`);

  css.push(`
.shot{position:absolute;inset:0;visibility:hidden;overflow:hidden;font-family:Inter,sans-serif;font-variant-numeric:tabular-nums}
.lbl{position:absolute;left:120px;top:100px;font:500 24px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;opacity:.65}
.crn{position:absolute;width:26px;height:26px;border-color:currentColor;border-style:solid;opacity:.45}
.big{position:absolute;left:120px;top:300px;font-weight:900;font-size:300px;letter-spacing:-.05em;display:flex;align-items:flex-start}
.big .u{font-size:.5em;margin-top:.25em;margin-right:.05em}
.cap{position:absolute;left:128px;top:690px;font:italic 400 76px "Instrument Serif"}
${odometerCss(300)}
.bars{position:absolute;left:220px;right:220px;bottom:190px;height:560px;display:flex;align-items:flex-end;gap:90px}
.bar{flex:1;position:relative;height:100%;display:flex;flex-direction:column;justify-content:flex-end}
.bar .fill{width:100%;border-radius:18px 18px 4px 4px;transform-origin:50% 100%}
.bar .v{position:absolute;left:0;right:0;text-align:center;font-weight:700;font-size:56px}
.bar .n{position:absolute;left:0;right:0;bottom:-70px;text-align:center;font:500 28px "Plex Mono";letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.ring{position:absolute;left:180px;top:190px;width:700px;height:700px}
.ringnum{position:absolute;left:180px;top:190px;width:700px;height:700px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:190px;letter-spacing:-.04em}
.ringnum .odo{height:190px;line-height:190px}.ringnum .odo-win,.ringnum .odo-strip i{height:190px;line-height:190px}
.side{position:absolute;left:1000px;top:380px;width:760px}
.side b{display:block;font-weight:900;font-size:64px;letter-spacing:-.03em;line-height:1.05}
.side span{display:block;margin-top:24px;font:500 28px "Plex Mono";opacity:.7}
.pill{position:absolute;left:120px;top:300px;display:inline-flex;align-items:center;gap:26px;padding:30px 60px;border-radius:200px;font-weight:900;font-size:220px;letter-spacing:-.05em}
.ins{position:absolute;left:128px;top:720px;right:120px;font-weight:700;font-size:72px;letter-spacing:-.025em;line-height:1.1}
.ins i{font:italic 400 1.1em "Instrument Serif"}
`);
  const corners = `<i class="crn" style="left:60px;top:60px;border-width:3px 0 0 3px"></i><i class="crn" style="right:60px;top:60px;border-width:3px 3px 0 0"></i><i class="crn" style="left:60px;bottom:60px;border-width:0 0 3px 3px"></i><i class="crn" style="right:60px;bottom:60px;border-width:0 3px 3px 0"></i>`;
  const shotLen = spec.shotLength || 3.2;
  let t = 0;
  const snaps = [];
  const shots = [];

  // 1 · total
  {
    const o = odometer("tot", fmt(total, L), { turns: 2, lineHeight: 300 });
    shots.push({
      bg: P.paper, fg: P.ink,
      html: `<div class="lbl">${esc(spec.title)}</div><div class="big"><span class="u">${esc(unit)}</span>${o.html}</div><div class="cap" id="totc">${esc(spec.totalCaption || "en total")}</div>`,
      js: (t0) => [o.js(t0 + 0.15, 1.6), `tl.fromTo("#totc",{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:"power3.out"},${r3(t0 + 1.5)});`],
      sfx: (t0) => [{ t: t0 + 1.75, kind: "ding" }],
    });
  }
  // 2 · bars
  {
    const bars = data
      .map((d, k) => {
        const h = (d.value / max) * 440;
        return `<div class="bar"><div class="v" id="bv${k}" style="bottom:${r3(h + 24)}px">${esc(unit)}${fmt(d.value, L)}</div><div class="fill" id="bf${k}" style="height:${r3(h)}px;background:${k === data.length - 1 ? P.accent : "#fff"}"></div><div class="n">${esc(d.label)}</div></div>`;
      })
      .join("");
    shots.push({
      bg: P.c1, fg: "#fff",
      html: `<div class="lbl">${esc(spec.barsLabel || "por periodo")}</div><div class="bars">${bars}</div>`,
      js: (t0) =>
        data.flatMap((_, k) => [
          `tl.fromTo("#bf${k}",{scaleY:0},{scaleY:1,duration:.7,ease:"expo.out"},${r3(t0 + 0.2 + k * 0.18)});`,
          `tl.fromTo("#bv${k}",{opacity:0,y:20},{opacity:1,y:0,duration:.4,ease:"power2.out"},${r3(t0 + 0.55 + k * 0.18)});`,
        ]),
      sfx: (t0) => data.map((_, k) => ({ t: t0 + 0.2 + k * 0.18, kind: "pop" })),
    });
  }
  // 3 · ring (only with a goal)
  if (pct != null) {
    const o = odometer("pct", pct, { turns: 1, lineHeight: 190 });
    shots.push({
      bg: P.c2, fg: "#fff",
      html:
        `<div class="lbl">${esc(spec.goalLabel || "avance de la meta")}</div>` +
        `<svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="9"/><circle id="rg" cx="50" cy="50" r="42" fill="none" stroke="${P.accent}" stroke-width="9" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 50 50)"/></svg>` +
        `<div class="ringnum">${o.html}<span style="font-size:.5em;margin-top:-.4em">%</span></div>` +
        `<div class="side"><b>${esc(unit)}${fmt(total, L)} de ${esc(unit)}${fmt(spec.goal, L)}</b><span>// meta ${esc(spec.goalPeriod || "")}</span></div>`,
      js: (t0) => [`tl.to("#rg",{strokeDashoffset:${100 - Math.min(100, pct)},duration:1.4,ease:"power3.inOut"},${r3(t0 + 0.2)});`, o.js(t0 + 0.2, 1.4)],
      sfx: (t0) => [{ t: t0 + 1.6, kind: "ding" }],
    });
  }
  // 4 · insight
  {
    const up = delta >= 0;
    shots.push({
      bg: P.accent, fg: P.ink,
      html:
        `<div class="lbl">${esc(spec.insightLabel || "lo importante")}</div>` +
        `<div class="pill" id="pl" style="background:${P.ink};color:${P.accent}">${up ? "↑" : "↓"} ${up ? "+" : "−"}${Math.abs(delta)}%</div>` +
        `<div class="ins" id="ins">${esc(last.label)} ${up ? "creció" : "bajó"} ${Math.abs(delta)}% <i>vs.</i> ${esc(prev.label)}</div>`,
      js: (t0) => [
        `tl.fromTo("#pl",{scale:.3,opacity:0,transformOrigin:"0% 50%"},{scale:1,opacity:1,duration:.55,ease:"back.out(2)"},${r3(t0 + 0.1)});`,
        `tl.fromTo("#ins",{opacity:0,y:30},{opacity:1,y:0,duration:.5,ease:"power3.out"},${r3(t0 + 0.6)});`,
      ],
      sfx: (t0) => [{ t: t0 + 0.1, kind: "thock" }],
    });
  }

  shots.forEach((s, i) => {
    html.push(`<div class="shot" id="sh${i}" style="background:${s.bg};color:${s.fg}">${corners}${s.html}</div>`);
    js.push(`tl.set("#sh${i}",{visibility:"visible"},${r3(t)});`);
    if (i < shots.length - 1) js.push(`tl.set("#sh${i}",{visibility:"hidden"},${r3(t + shotLen)});`);
    js.push(...s.js(t));
    sfx.push({ t, kind: "kick" }, ...s.sfx(t));
    snaps.push(t + shotLen - 0.3);
    t += shotLen;
  });
  ctx.duration = r3(t);
  ctx.bpm = 0;
  ctx.snapshots = snaps;
}
