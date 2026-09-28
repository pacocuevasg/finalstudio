// collage-vox: kraft paper, torn cut-outs, sticky notes, hatched "engraving"
// illustrations drawn in SVG (original line work, no archive images), serif
// headlines with one keyword in colour, and red marker annotations drawn by
// hand. Ideas change with a paper sweep. For history, geography, literature.
// Torn edges come from a seeded PRNG so every render is identical.
import { esc, r3, rng } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("serif").add("hand").add("mono").add("inter");
  const R = rng(spec.seed || 17);
  const RED = "#d8342b";
  // torn polygon in percent: jitter every edge
  const torn = (amp = 1.6, n = 18) => {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push([(i / n) * 100, R() * amp]);
    for (let i = 0; i <= n; i++) pts.push([100 - R() * amp, (i / n) * 100]);
    for (let i = n; i >= 0; i--) pts.push([(i / n) * 100, 100 - R() * amp]);
    for (let i = n; i >= 0; i--) pts.push([R() * amp, (i / n) * 100]);
    return `polygon(${pts.map(([x, y]) => `${r3(x)}% ${r3(y)}%`).join(",")})`;
  };
  const hatch = (id, ang, gap = 9, col = "#2b2118") => `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${ang})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${col}" stroke-width="2"/></pattern>`;
  const ENG = {
    river: () => `<svg width="560" height="560" viewBox="0 0 560 560"><defs>${hatch("h1", 35)}${hatch("h2", -35, 12)}</defs>
<path d="M60 40 C150 60 170 140 200 220 C230 300 180 380 220 470 C240 520 300 540 380 530 L520 540 L520 30 Z" fill="url(#h1)" opacity=".85"/>
<path d="M40 40 L180 40 C150 140 120 260 150 380 C170 460 140 520 60 530 L40 530 Z" fill="url(#h2)" opacity=".6"/>
<path d="M190 30 C230 130 200 220 250 300 C300 380 250 450 300 540" fill="none" stroke="#1f3b5c" stroke-width="22" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" class="dw"/>
<text x="330" y="120" font-family="Instrument Serif" font-style="italic" font-size="40" fill="#2b2118">desierto</text></svg>`,
    flood: () => `<svg width="560" height="560" viewBox="0 0 560 560">${Array.from({ length: 9 }, (_, k) => `<path d="M20 ${120 + k * 40} ${Array.from({ length: 8 }, (_, j) => `q 34 ${k % 2 ? -18 : -24} 68 0`).join(" ")}" fill="none" stroke="#1f3b5c" stroke-width="${3 + (k % 3)}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" class="dw"/>`).join("")}</svg>`,
    wheat: () => `<svg width="560" height="560" viewBox="0 0 560 560">${Array.from({ length: 7 }, (_, k) => { const x = 70 + k * 70, lean = (k - 3) * 6; return `<path d="M${x} 540 Q ${x + lean} 330 ${x + lean * 2} 160" fill="none" stroke="#2b2118" stroke-width="4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" class="dw"/>` + Array.from({ length: 6 }, (_, j) => `<ellipse cx="${x + lean * 2 + (j % 2 ? 14 : -14)}" cy="${170 + j * 26}" rx="11" ry="22" transform="rotate(${j % 2 ? 30 : -30} ${x + lean * 2 + (j % 2 ? 14 : -14)} ${170 + j * 26})" fill="none" stroke="#2b2118" stroke-width="3" class="gr"/>`).join(""); }).join("")}</svg>`,
  };
  css.push(`
#stage{position:absolute;inset:0;background:#c79f73;overflow:hidden}
#stage:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(80,50,20,.18) 1px,transparent 1.5px),radial-gradient(rgba(255,240,210,.18) 1px,transparent 1.5px);background-size:6px 6px,9px 9px;background-position:0 0,3px 4px}
.idea{position:absolute;inset:0}
.cut{position:absolute;background:#f6f1e6;padding:56px 64px;box-shadow:0 18px 30px -18px rgba(40,20,0,.6)}
.cut h2{font:400 104px/1 "Instrument Serif";color:#1d1712;letter-spacing:-.01em}
.cut h2 em{font-style:italic;color:${RED}}
.cut p{font:400 34px/1.25 Inter;color:#3a3028;margin-top:22px;max-width:760px}
.eng{position:absolute;background:#efe6d2;padding:24px}
.note{position:absolute;width:360px;padding:34px 30px;background:#ffe45c;font:700 50px/1.05 Caveat;color:#1d1712;box-shadow:0 16px 24px -14px rgba(40,20,0,.55)}
.tape{position:absolute;width:150px;height:44px;background:rgba(255,255,255,.55);left:50%;top:-20px;margin-left:-75px;transform:rotate(-4deg)}
.lbl{position:absolute;left:96px;top:60px;font:500 22px "Plex Mono";letter-spacing:.16em;text-transform:uppercase;color:#4a3420}
svg.mk{position:absolute;left:0;top:0;overflow:visible}
#sweep{position:absolute;left:0;top:-80px;width:${W + 400}px;height:${H + 160}px;background:#b88c5c;clip-path:${torn(3, 12)}}
#sweep:after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(80,50,20,.25) 1px,transparent 1.5px);background-size:6px 6px}
`);
  const ideas = spec.ideas;
  const blocks = ideas.map((d, i) => {
    const flip = i % 2;
    const cutX = flip ? 860 : 110, engX = flip ? 170 : 1230, noteX = flip ? 1450 : 1250;
    const headline = esc(d.title).replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return `<div class="idea" id="i${i}" style="visibility:hidden">
<div class="eng" id="i${i}e" style="left:${engX}px;top:180px;clip-path:${torn(2.4)}">${ENG[d.engraving]()}</div>
<div class="cut" id="i${i}c" style="left:${cutX}px;top:${flip ? 170 : 230}px;clip-path:${torn()}"><h2>${headline}</h2><p>${esc(d.text || "")}</p></div>
${d.note ? `<div class="note" id="i${i}n" style="left:${noteX}px;top:${flip ? 700 : 720}px"><div class="tape"></div>${esc(d.note)}</div>` : ""}
<svg class="mk" width="${W}" height="${H}"><path id="i${i}m" d="${d.mark || ""}" fill="none" stroke="${RED}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>
</div>`;
  });
  html.push(`<div id="stage"><div class="lbl">${esc(spec.kicker || "")}</div>${blocks.join("")}<div id="sweep"></div></div>`);
  js.push(`tl.set("#sweep",{x:${-W - 500}},0);`);
  let t = 0.2;
  const snaps = [];
  ideas.forEach((d, i) => {
    js.push(`tl.set("#i${i}",{visibility:"visible"},${r3(t)});`);
    const rot = (k) => r3((R() - 0.5) * 5);
    js.push(`tl.fromTo("#i${i}e",{y:700,rotation:${rot()}},{y:0,rotation:${rot()},duration:.6,ease:"power3.out"},${r3(t)});`);
    js.push(`tl.fromTo("#i${i}c",{x:${i % 2 ? 900 : -900},rotation:${rot()}},{x:0,rotation:${rot()},duration:.6,ease:"power3.out"},${r3(t + 0.15)});`);
    sfx.push({ t, kind: "whoosh" }, { t: t + 0.6, kind: "thock" });
    js.push(`tl.to("#i${i}e .dw",{strokeDashoffset:0,duration:1,stagger:.06,ease:"power1.inOut"},${r3(t + 0.6)});`);
    if (ENG[d.engraving] && d.engraving === "wheat") js.push(`tl.fromTo("#i${i}e .gr",{opacity:0},{opacity:1,duration:.2,stagger:.02},${r3(t + 1.1)});`);
    if (d.note) {
      js.push(`tl.fromTo("#i${i}n",{scale:1.4,opacity:0,rotation:-8},{scale:1,opacity:1,rotation:${i % 2 ? 4 : -3},duration:.35,ease:"back.out(2)"},${r3(t + 1.2)});`);
      sfx.push({ t: t + 1.25, kind: "pop" });
    }
    if (d.mark) {
      js.push(`tl.to("#i${i}m",{strokeDashoffset:0,duration:.6,ease:"power2.inOut"},${r3(t + 1.7)});`);
      sfx.push({ t: t + 1.7, kind: "scribble", len: 0.6 });
    }
    snaps.push(t + 2.8);
    const hold = d.hold || 3.4;
    if (i < ideas.length - 1) {
      const ts = t + hold;
      js.push(`tl.to("#sweep",{x:${-100},duration:.45,ease:"power2.in"},${r3(ts)});`);
      js.push(`tl.set("#i${i}",{visibility:"hidden"},${r3(ts + 0.46)});`);
      js.push(`tl.to("#sweep",{x:${W + 200},duration:.45,ease:"power2.out"},${r3(ts + 0.5)});`);
      js.push(`tl.set("#sweep",{x:${-W - 500}},${r3(ts + 0.96)});`);
      sfx.push({ t: ts, kind: "whoosh" });
      t = ts + 0.5;
    } else t += hold;
  });
  ctx.duration = r3(t + 0.3);
  ctx.snapshots = snaps;
}
