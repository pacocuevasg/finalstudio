// notebook-marker: graph-paper notebook, lines hand-written on by a pencil,
// yellow marker highlights, a drawn circle and arrow to a callout.
// Mixes the hand-drawn explainer wave (Mebbian, Claude Code Security, the
// HyperFrames hw-* and vox-annotate blocks) into one tutoring scene.
//
// Line markup: {text} = marker highlight, [text] = circled answer,
// [text|callout] = circled answer with an arrow to a callout.
import { esc, rich, r3, assertFact } from "../lib.mjs";

const CHAR_T = 0.05; // seconds per character while writing

function tokens(line) {
  // split into plain / highlight / circle segments
  const out = [];
  const re = /\{([^}]+)\}|\[([^\]|]+)(?:\|([^\]]+))?\]/g;
  let last = 0, m;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({ kind: "plain", text: line.slice(last, m.index) });
    if (m[1] != null) out.push({ kind: "hl", text: m[1] });
    else out.push({ kind: "circ", text: m[2], callout: m[3] });
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ kind: "plain", text: line.slice(last) });
  return out;
}

// Evaluate "a × b ÷ c = d" style lines so a wrong number stops the build.
function checkArithmetic(plain, vars = {}) {
  if (!plain.includes("=")) return 0;
  let expr = plain.replace(/[$€]/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, "");
  for (const [k, v] of Object.entries(vars)) expr = expr.replace(new RegExp(`\\b${k}\\b`, "g"), `(${v})`);
  const sides = expr.split("=").map((s) => s.trim()).filter((s) => /^[\d\s.+\-*/()]+$/.test(s));
  if (sides.length < 2) return 0; // only lines with two pure-number sides are checked
  const vals = sides.map((s) => Function(`return (${s})`)());
  for (let i = 1; i < vals.length; i++) assertFact(Math.abs(vals[i] - vals[0]) < 1e-9, `"${plain}" (${vals[0]} ≠ ${vals[i]})`);
  return 1;
}

export function build(spec, ctx) {
  const P = { paper: "#fbfaf5", grid: "#dfe8f1", margin: "#f0a9a0", ink: "#1b2a4a", marker: "#ffe45c", pen: "#e2462f", ...(spec.palette || {}) };
  ctx.fonts.add("hand").add("mono");
  ctx.duration = spec.duration;
  const { css, html, js, sfx } = ctx;
  css.push(`
#stage{position:absolute;inset:0;background:${P.paper};color:${P.ink};font-family:Caveat,cursive;transform-origin:40% 45%;
  background-image:linear-gradient(${P.grid} 1.5px,transparent 1.5px),linear-gradient(90deg,${P.grid} 1.5px,transparent 1.5px);background-size:48px 48px;background-position:-1px 23px}
#margin{position:absolute;top:0;bottom:0;left:190px;width:3px;background:${P.margin}}
.holes{position:absolute;left:62px;top:0;bottom:0;width:40px}
.holes i{position:absolute;left:0;width:34px;height:34px;border-radius:50%;background:#e9e6dc;box-shadow:inset 0 3px 5px rgba(0,0,0,.18)}
.title{position:absolute;left:250px;top:92px;font-weight:700;font-size:112px;line-height:1}
.ln{position:absolute;left:250px;font-weight:500;font-size:84px;line-height:1;white-space:nowrap}
.wr{position:relative;display:inline-block}
.ink{display:inline-block;clip-path:inset(-20% 100% -30% -5%)}
.pencil{position:absolute;top:-58px;left:0;width:100%;height:120px;opacity:0;pointer-events:none}.pencil svg{position:absolute;left:-8px;top:0;width:120px;height:120px}
.hl{position:relative;display:inline-block}
.hl>em{position:relative;z-index:1;font-style:normal}.hl>b{position:absolute;z-index:0;left:-.12em;right:-.12em;top:.18em;bottom:.02em;background:${P.marker};mix-blend-mode:multiply;transform-origin:0 50%;transform:scaleX(0);border-radius:.12em .3em .2em .35em;font-weight:inherit}
.circ{position:relative;display:inline-block}
.circ svg{position:absolute;left:-28%;top:-32%;width:156%;height:164%;overflow:visible}
.callout{position:absolute;left:calc(128% + 150px);top:-.9em;white-space:nowrap;color:${P.pen};font-weight:700;font-size:.92em}
.cin{display:inline-block}.callout svg{position:absolute;right:100%;top:.35em;width:150px;height:90px;margin-right:4px;overflow:visible}
.note{position:absolute;right:120px;font:500 26px "Plex Mono";color:#8a93a6;letter-spacing:.02em;text-align:right}
`);
  const holes = [150, 540, 930].map((y) => `<i style="top:${y}px"></i>`).join("");
  html.push(`<div id="stage"><div class="holes">${holes}</div><div id="margin"></div>`);
  const pencil = `<svg viewBox="0 0 120 120"><g transform="rotate(-38 60 60)"><rect x="52" y="0" width="16" height="78" rx="2" fill="#f2b632"/><rect x="52" y="0" width="16" height="12" fill="#e6818f"/><rect x="52" y="12" width="16" height="6" fill="#b8b8b8"/><path d="M52 78 L68 78 L60 100 Z" fill="#f3d7a6"/><path d="M57.5 93 L62.5 93 L60 100 Z" fill="${P.ink}"/></g></svg>`;

  // write-on helper: clip wipe + pencil riding the edge
  const writeOn = (id, text, at) => {
    const dur = Math.max(0.35, text.length * CHAR_T);
    js.push(`tl.set("#${id}p",{opacity:1},${r3(at)});`);
    js.push(`tl.fromTo("#${id}i",{clipPath:"inset(-20% 100% -30% -5%)"},{clipPath:"inset(-20% -5% -30% -5%)",duration:${r3(dur)},ease:"none"},${r3(at)});`);
    js.push(`tl.fromTo("#${id}p",{xPercent:0},{xPercent:100,duration:${r3(dur)},ease:"none"},${r3(at)});`);
    js.push(`tl.fromTo("#${id}pw",{y:0},{y:-6,duration:.09,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor(dur / 0.09) - 1)}},${r3(at)});`);
    js.push(`tl.set("#${id}p",{opacity:0},${r3(at + dur + 0.05)});`);
    // once written, open the clip so circles and callouts can spill outside the line
    js.push(`tl.set("#${id}i",{clipPath:"inset(-300% -400% -300% -40%)"},${r3(at + dur + 0.02)});`);
    sfx.push({ t: at, kind: "scribble", len: dur });
    return at + dur;
  };
  const wrap = (id, inner) =>
    `<span class="wr"><span class="ink" id="${id}i">${inner}</span><span class="pencil" id="${id}p"><span id="${id}pw" style="display:block">${pencil}</span></span></span>`;

  // title
  const tEnd = writeOn("ttl", spec.title, spec.titleAt ?? 0.3);
  html.push(`<div class="title">${wrap("ttl", esc(spec.title))}</div>`);
  const snaps = [tEnd + 0.3];

  const LH = spec.lineHeight || 144;
  const top0 = spec.top || 300;
  let tCursor = tEnd + 0.3;
  let checked = 0;
  spec.lines.forEach((ln, i) => {
    const at = ln.at ?? tCursor;
    const segs = tokens(ln.text);
    const plain = segs.map((s) => s.text).join("");
    checked += checkArithmetic(plain, spec.vars);
    const id = `l${i}`;
    const segHtml = segs
      .map((s, k) => {
        if (s.kind === "plain") return rich(s.text);
        if (s.kind === "hl") return `<span class="hl"><b id="${id}h${k}"></b><em>${rich(s.text)}</em></span>`;
        const call = s.callout
          ? `<span class="callout" id="${id}c${k}"><svg viewBox="0 0 150 90"><path id="${id}a${k}" d="M146 34 C 110 30, 50 40, 6 80 M 6 80 L 30 78 M 6 80 L 12 57" pathLength="1" fill="none" stroke="${P.pen}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg><span class="cin" id="${id}s${k}">${esc(s.callout)}</span></span>`
          : "";
        return `<span class="circ">${rich(s.text)}<svg viewBox="0 0 100 60" preserveAspectRatio="none"><path id="${id}o${k}" d="M88 14 C 70 0, 18 2, 7 22 C -2 42, 30 58, 60 56 C 88 54, 102 36, 92 18 C 88 10, 78 6, 70 5" pathLength="1" fill="none" stroke="${P.pen}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/></svg>${call}</span>`;
      })
      .join("");
    html.push(`<div class="ln" style="top:${top0 + i * LH}px">${wrap(id, segHtml)}</div>`);
    if (ln.note) html.push(`<div class="note" id="${id}n" style="top:${top0 + i * LH + 30}px">${esc(ln.note)}</div>`);
    const end = writeOn(id, plain, at);
    let t = end + 0.15;
    if (ln.note) js.push(`tl.fromTo("#${id}n",{opacity:0,x:20},{opacity:1,x:0,duration:.4,ease:"power2.out"},${r3(at + 0.2)});`);
    segs.forEach((s, k) => {
      if (s.kind === "hl") {
        js.push(`tl.fromTo("#${id}h${k}",{scaleX:0,rotation:-1.2},{scaleX:1,rotation:-1.2,duration:.45,ease:"power2.out"},${r3(t)});`);
        sfx.push({ t, kind: "scribble", len: 0.45 });
        t += 0.5;
      } else if (s.kind === "circ") {
        js.push(`tl.to("#${id}o${k}",{strokeDashoffset:0,duration:.6,ease:"power1.inOut"},${r3(t)});`);
        sfx.push({ t, kind: "scribble", len: 0.6 });
        t += 0.65;
        if (s.callout) {
          js.push(`tl.to("#${id}a${k}",{strokeDashoffset:0,duration:.45,ease:"power2.out"},${r3(t)});`);
          js.push(`tl.fromTo("#${id}c${k}",{opacity:0},{opacity:1,duration:.01},${r3(t)});`);
          js.push(`tl.fromTo("#${id}s${k}",{scale:.6,transformOrigin:"0% 50%"},{scale:1,duration:.4,ease:"back.out(2.5)"},${r3(t + 0.3)});`);
          sfx.push({ t: t + 0.3, kind: "pop" });
          t += 0.8;
        }
      }
    });
    tCursor = t + (ln.pause ?? 0.9);
    snaps.push(t + 0.2);
  });
  // camera: slow drift down the page, then settle on the answer
  js.push(`tl.fromTo("#stage",{scale:1.06,y:40},{scale:1,y:0,duration:${ctx.duration},ease:"sine.inOut"},0);`);
  html.push(`</div>`);
  if (checked) console.log(`✓ arithmetic check: ${checked} line(s) hold`);
  ctx.snapshots = snaps;
  if (tCursor > ctx.duration) console.warn(`! lines end at ${r3(tCursor)}s, after duration ${ctx.duration}s`);
}
