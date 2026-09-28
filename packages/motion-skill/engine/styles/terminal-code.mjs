// terminal-code: a tilted terminal that swings flat, commands typed key by key,
// real output lines, and one plain-language caption per command. The look of
// the Remotion Agent Skills and "Opus Video Studio" launch clips, pointed at
// programming lessons. Typing is fine here: it is what a terminal does.
import { esc, r3 } from "../lib.mjs";

const FS = 34; // terminal font size; JetBrains Mono advance is exactly 0.6em
const CW = FS * 0.6;
const LH = 52;

export function build(spec, ctx) {
  const P = { bg1: "#eef0f4", bg2: "#dfe5f0", win: "#fbfbfd", ink: "#1d2330", dim: "#8a93a6", prompt: "#6b4ef6", ok: "#169a5a", accent: "#6b4ef6", ...(spec.palette || {}) };
  ctx.fonts.add("code").add("inter").add("mono");
  const { css, html, js, sfx } = ctx;
  css.push(`
#stage{position:absolute;inset:0;background:radial-gradient(1400px 900px at 30% 20%,${P.bg1},${P.bg2});perspective:2200px;font-family:Inter,sans-serif;color:${P.ink}}
#cam{position:absolute;inset:0;transform-origin:50% 45%}
#win{position:absolute;left:230px;top:120px;width:1460px;height:700px;background:${P.win};border-radius:22px;box-shadow:0 60px 120px -40px rgba(30,40,80,.35),0 0 0 1px rgba(30,40,80,.08);overflow:hidden;transform-origin:50% 50%}
.bar{height:64px;display:flex;align-items:center;gap:12px;padding:0 26px;border-bottom:1px solid #e8eaf0;font:500 22px "Plex Mono";color:${P.dim}}
.bar i{width:16px;height:16px;border-radius:50%;background:#d9dce4}
.bar span{margin-left:auto;margin-right:auto;transform:translateX(-30px)}
#scroll{position:absolute;left:0;right:0;top:64px;bottom:0;overflow:hidden}
#lines{position:absolute;left:48px;top:34px;font:400 ${FS}px/${LH}px "JetBrains Mono";white-space:pre;font-variant-ligatures:none;font-feature-settings:"liga" 0,"calt" 0}
.row{height:${LH}px;position:relative}
.pr{color:${P.prompt};font-weight:700}
.typed{display:inline-block;clip-path:inset(0 100% 0 0)}
.cur{position:absolute;top:8px;width:${r3(CW)}px;height:${LH - 16}px;background:${P.ink};opacity:0}
.out{color:${P.dim}}
.out.ok{color:${P.ok}}
.cap{position:absolute;left:230px;top:880px;font-weight:700;font-size:58px;letter-spacing:-.025em;opacity:0}
.cap b{font:500 26px "Plex Mono";color:${P.accent};letter-spacing:.1em;margin-right:22px;vertical-align:middle}
.ttl{position:absolute;left:230px;top:52px;font:500 24px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:${P.dim}}
`);
  const promptTxt = `${spec.cwd || "~/proyecto"} $ `;
  const rows = [];
  let t = 0.9;
  const snaps = [];
  spec.steps.forEach((s, i) => {
    const r = rows.length;
    const n = s.cmd.length;
    rows.push(
      `<div class="row" id="r${i}" style="opacity:0"><span class="pr">${esc(promptTxt)}</span><span class="typed" id="c${i}">${esc(s.cmd)}</span><span class="cur" id="k${i}" style="left:${r3(promptTxt.length * CW)}px"></span></div>`
    );
    const typeDur = Math.max(0.3, n * (spec.keyTime || 0.055));
    js.push(`tl.set("#r${i}",{opacity:1},${r3(Math.max(0, t - 0.35))});`);
    js.push(`tl.set("#k${i}",{opacity:1},${r3(t)});`);
    js.push(`tl.fromTo("#c${i}",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:${r3(typeDur)},ease:"steps(${n})"},${r3(t)});`);
    js.push(`tl.fromTo("#k${i}",{x:0},{x:${r3(n * CW)},duration:${r3(typeDur)},ease:"steps(${n})"},${r3(t)});`);
    for (let c = 0; c < n; c++) if (s.cmd[c] !== " ") sfx.push({ t: t + (c / n) * typeDur, kind: "key" });
    // caption for this command
    html.push(`<div class="cap" id="cap${i}"><b>${String(i + 1).padStart(2, "0")}</b>${esc(s.caption || "")}</div>`);
    js.push(`tl.fromTo("#cap${i}",{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power3.out"},${r3(t + 0.1)});`);
    const enter = t + typeDur + 0.25;
    js.push(`tl.set("#k${i}",{opacity:0},${r3(enter)});`);
    sfx.push({ t: enter, kind: "click" });
    // output lines print instantly, one per frame pair
    (s.out || []).forEach((line, k) => {
      rows.push(`<div class="row out${/^\s*(✓|done|ok)/i.test(line) || s.okLines?.includes(k) ? " ok" : ""}" id="o${i}_${k}" style="opacity:0">${esc(line)}</div>`);
      js.push(`tl.set("#o${i}_${k}",{opacity:1},${r3(enter + 0.12 + k * 0.07)});`);
    });
    const lastRow = rows.length;
    // keep the newest line inside the window: scroll the text block up in whole rows
    const visible = 11;
    if (lastRow > visible) js.push(`tl.to("#lines",{y:${-(lastRow - visible) * LH},duration:.35,ease:"power2.out"},${r3(enter + 0.1)});`);
    const stepEnd = enter + 0.3 + (s.out?.length || 0) * 0.07 + (s.hold ?? 1.6);
    if (i < spec.steps.length - 1) js.push(`tl.to("#cap${i}",{opacity:0,y:-16,duration:.3,ease:"power2.in"},${r3(stepEnd - 0.3)});`);
    snaps.push(stepEnd - 0.4);
    t = stepEnd;
    void r;
  });
  html.unshift(
    `<div id="stage"><div class="ttl">${esc(spec.title || "")}</div><div id="cam"><div id="win"><div class="bar"><i></i><i></i><i></i><span>${esc(spec.windowTitle || "terminal")}</span></div><div id="scroll"><div id="lines">${rows.join("")}</div></div></div></div>`
  );
  html.push(`</div>`);
  // camera: tilted establishing shot swings flat as the first command starts, then a slow push
  js.push(`tl.fromTo("#win",{rotationX:16,rotationY:-22,rotationZ:3,scale:.86,y:30},{rotationX:0,rotationY:0,rotationZ:0,scale:1,y:0,duration:1.4,ease:"power3.inOut"},0);`);
  js.push(`tl.fromTo("#cam",{scale:1},{scale:1.05,duration:${r3(t)},ease:"none"},0);`);
  sfx.push({ t: 0.05, kind: "whoosh" });
  ctx.duration = r3(t + 0.4);
  ctx.snapshots = snaps;
}
