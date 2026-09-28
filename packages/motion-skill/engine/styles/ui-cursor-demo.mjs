// ui-cursor-demo: a software procedure told with an oversized cursor. The
// camera pushes in on every click, the formula is typed into the cell, the
// referenced cells light up, the fill handle drags the result down.
// This is the most common launch-video grammar (UI + cursor + push-in, 159 of
// Montaj's 260 references) pointed at "how do I do X in a spreadsheet".
// The app chrome is generic on purpose: never imitate a real product's UI.
import { esc, r3, assertFact } from "../lib.mjs";

const COLS = "ABCDEFGH";

export function build(spec, ctx) {
  const P = { bg: "#e9ecf2", win: "#ffffff", chrome: "#f5f6f8", line: "#e3e6ec", ink: "#1e2430", dim: "#7b8496", sel: "#1a73e8", ref1: "#1a73e8", ref2: "#e8453c", head: "#f1f3f6", accent: "#12a150", ...(spec.palette || {}) };
  ctx.fonts.add("inter").add("code").add("mono");
  const { css, html, js, sfx } = ctx;
  const cols = spec.columns; // header labels
  const widths = spec.widths || [70, 380, 230, 230, 260];
  const RH = 66, X0 = 0, Y0 = 0; // grid-local origin
  const WIN = { x: 150, y: 90, w: 1620, h: 830 };
  const GRID = { x: WIN.x + 40, y: WIN.y + 172 + RH };
  const colX = (c) => GRID.x + widths.slice(0, c + 1).reduce((a, b) => a + b, 0); // left edge of column c (0 = A)
  const rowY = (r) => GRID.y + RH * (r + 1); // r = 0 is the first data row (sheet row 2)
  const target = cols.length - 1; // formula column (last)
  const L = spec.locale || "es-MX";
  const money = (v) => `$${v.toLocaleString(L)}`;

  // --- facts: evaluate the formula for every row ---
  const values = spec.rows.map((row, r) => {
    const sheetRow = r + 2;
    const expr = spec.formula.replace(/^=/, "").replace(/([A-Z])\{r\}/g, (_, c) => String(row[COLS.indexOf(c)]));
    const v = Function(`return (${expr})`)();
    assertFact(Number.isFinite(v), `formula ${spec.formula} on row ${sheetRow}`);
    return v;
  });
  if (spec.expect) spec.expect.forEach((e, r) => assertFact(values[r] === e, `row ${r + 2}: ${values[r]} ≠ expected ${e}`));
  console.log(`✓ formula ${spec.formula}: ${values.join(", ")}`);
  const f0 = spec.formula.replace(/\{r\}/g, "2");

  css.push(`
#stage{position:absolute;inset:0;background:${P.bg};font-family:Inter,sans-serif;color:${P.ink}}
#cam{position:absolute;inset:0;transform-origin:0 0}
#win{position:absolute;left:${WIN.x}px;top:${WIN.y}px;width:${WIN.w}px;height:${WIN.h}px;background:${P.win};border-radius:18px;box-shadow:0 50px 100px -40px rgba(20,30,60,.35),0 0 0 1px rgba(20,30,60,.08);overflow:hidden}
.tb{height:58px;background:${P.chrome};border-bottom:1px solid ${P.line};display:flex;align-items:center;gap:12px;padding:0 22px;font:500 21px "Plex Mono";color:${P.dim}}
.tb i{width:15px;height:15px;border-radius:50%;background:#d6d9e0}.tb span{margin:0 auto}
.tools{height:56px;border-bottom:1px solid ${P.line};display:flex;align-items:center;gap:18px;padding:0 26px}
.tools u{display:block;width:34px;height:18px;border-radius:5px;background:#e9ecf1;text-decoration:none}
.fx{position:absolute;left:0;right:0;top:114px;height:56px;border-bottom:1px solid ${P.line};display:flex;align-items:center;font:400 26px "JetBrains Mono"}
.fx .nm{width:130px;text-align:center;border-right:1px solid ${P.line};height:100%;line-height:56px;font:600 22px Inter;color:${P.dim}}
.fx .ic{width:70px;text-align:center;font:italic 600 24px Inter;color:${P.dim}}
.typed{display:inline-block;clip-path:inset(0 100% 0 0);white-space:pre}
.cell{position:absolute;height:${RH}px;line-height:${RH}px;border-right:1px solid ${P.line};border-bottom:1px solid ${P.line};padding:0 20px;font-size:28px;white-space:nowrap;overflow:hidden}
.hd{background:${P.head};color:${P.dim};font-weight:600;font-size:22px;text-align:center;padding:0}
.num{text-align:right;font-variant-numeric:tabular-nums}
.selbox{position:absolute;border:4px solid ${P.sel};border-radius:3px;transform-origin:0 0;opacity:0}
.selbox .h{position:absolute;right:-9px;bottom:-9px;width:14px;height:14px;background:${P.sel};border:2px solid #fff}
.ref{position:absolute;border:3px dashed;border-radius:3px;opacity:0}
#cur{position:absolute;left:0;top:0;width:64px;height:84px;z-index:20}
#cur svg{width:64px;height:84px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.25))}
.rip{position:absolute;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;border:4px solid ${P.sel};opacity:0}
.cap{position:absolute;left:50%;bottom:54px;transform:translateX(-50%);background:${P.ink};color:#fff;border-radius:60px;padding:22px 44px;font-weight:600;font-size:36px;white-space:nowrap;opacity:0}
.cap b{display:inline-block;margin-right:18px;color:${P.accent};font:600 26px "Plex Mono"}
`);
  // ---- grid DOM (coordinates are stage pixels; #cam scales everything together) ----
  const cells = [];
  const colL = (c) => GRID.x + widths.slice(0, c).reduce((a, b) => a + b, 0);
  // header row (A, B, C...) and row numbers
  cells.push(`<div class="cell hd" style="left:${colL(0)}px;top:${GRID.y - RH}px;width:${widths[0]}px"></div>`);
  cols.forEach((_, c) => cells.push(`<div class="cell hd" style="left:${colL(c + 1)}px;top:${GRID.y - RH}px;width:${widths[c + 1]}px">${COLS[c]}</div>`));
  const nRows = spec.rows.length + 1;
  for (let r = 0; r < nRows + 2; r++) cells.push(`<div class="cell hd" style="left:${colL(0)}px;top:${GRID.y + r * RH}px;width:${widths[0]}px">${r + 1}</div>`);
  // labels row (sheet row 1)
  cols.forEach((h, c) => cells.push(`<div class="cell" style="left:${colL(c + 1)}px;top:${GRID.y}px;width:${widths[c + 1]}px;font-weight:700">${esc(h)}</div>`));
  // data rows
  spec.rows.forEach((row, r) => {
    row.forEach((v, c) => {
      const isNum = typeof v === "number";
      const shown = isNum && spec.moneyCols?.includes(COLS[c]) ? money(v) : v;
      cells.push(`<div class="cell${isNum ? " num" : ""}" style="left:${colL(c + 1)}px;top:${rowY(r)}px;width:${widths[c + 1]}px">${esc(shown)}</div>`);
    });
    // result cells, hidden until computed
    cells.push(
      `<div class="cell num" id="res${r}" style="left:${colL(target + 1)}px;top:${rowY(r)}px;width:${widths[target + 1]}px;opacity:0;font-weight:700;color:${P.accent}">${esc(money(values[r]))}</div>`
    );
  });
  // empty trailing rows
  for (let r = spec.rows.length; r < spec.rows.length + 2; r++)
    cols.forEach((_, c) => cells.push(`<div class="cell" style="left:${colL(c + 1)}px;top:${rowY(r)}px;width:${widths[c + 1]}px"></div>`));

  const tc = { x: colL(target + 1), y: rowY(0), w: widths[target + 1] }; // first formula cell
  const refCells = [...spec.formula.matchAll(/([A-Z])\{r\}/g)].map((m) => COLS.indexOf(m[1]));
  const refs = refCells.map((c, k) => `<div class="ref" id="ref${k}" style="left:${colL(c + 1) - 2}px;top:${rowY(0) - 2}px;width:${widths[c + 1] + 4}px;height:${RH + 4}px;border-color:${k ? P.ref2 : P.ref1};background:${k ? "rgba(232,69,60,.07)" : "rgba(26,115,232,.07)"}"></div>`);
  const inCell = `<div class="cell" id="edit" style="left:${tc.x}px;top:${tc.y}px;width:${tc.w}px;font:400 26px/${RH}px 'JetBrains Mono';opacity:0;background:#fff;z-index:3"><span class="typed" id="tpc">${esc(f0)}</span></div>`;

  const cursor = `<div id="cur"><svg viewBox="0 0 32 42"><path d="M2 2 L2 33 L10 25.5 L15.5 38 L21 35.6 L15.6 23.4 L26 23.4 Z" fill="#111" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg></div>`;
  html.push(`<div id="stage"><div id="cam">
<div id="win"><div class="tb"><i></i><i></i><i></i><span>${esc(spec.appTitle || "Hoja de cálculo")}</span></div><div class="tools">${"<u></u>".repeat(14)}</div>
<div class="fx"><div class="nm" id="nm">${COLS[target]}2</div><div class="ic">fx</div><div><span class="typed" id="tpf">${esc(f0)}</span></div></div></div>
${cells.join("")}${refs.join("")}${inCell}
<div class="selbox" id="sel" style="left:${tc.x - 2}px;top:${tc.y - 2}px;width:${tc.w + 4}px;height:${RH + 4}px"><i class="h"></i></div>
<div class="abs" id="rng" style="left:${tc.x}px;top:${tc.y}px;width:${tc.w}px;height:${RH * spec.rows.length}px;background:rgba(26,115,232,.10);transform-origin:0 0;opacity:0"></div>
<div class="selbox" id="selAll" style="left:${tc.x - 2}px;top:${tc.y - 2}px;width:${tc.w + 4}px;height:${RH * spec.rows.length + 4}px"><i class="h"></i></div>
<div class="rip" id="rip1"></div><div class="rip" id="rip2"></div>
${cursor}
</div>`);

  // ---- choreography ----
  const S = spec.captions || [];
  const cap = (k, at, until) => {
    html.push(`<div class="cap" id="cap${k}"><b>${String(k + 1).padStart(2, "0")}</b>${esc(S[k] || "")}</div>`);
    js.push(`tl.fromTo("#cap${k}",{opacity:0,y:20},{opacity:1,y:0,duration:.4,ease:"power3.out"},${r3(at)});`);
    if (until) js.push(`tl.to("#cap${k}",{opacity:0,duration:.25},${r3(until)});`);
  };
  const camTo = (px, py, s, at, dur = 0.9) => {
    const k = 0.35; // how far the point travels toward frame centre
    const tx = px + (960 - px) * k - s * px, ty = py + (540 - py) * k - s * py;
    js.push(`tl.to("#cam",{x:${r3(tx)},y:${r3(ty)},scale:${s},duration:${dur},ease:"power3.inOut"},${r3(at)});`);
  };
  const click = (id, x, y, at) => {
    js.push(`tl.set("#${id}",{left:${r3(x)},top:${r3(y)}},${r3(at)});`);
    js.push(`tl.fromTo("#${id}",{scale:.3,opacity:.9},{scale:1.6,opacity:0,duration:.5,ease:"power2.out"},${r3(at)});`);
    js.push(`tl.to("#cur svg",{scale:.86,duration:.08,yoyo:true,repeat:1,transformOrigin:"10% 10%"},${r3(at)});`);
    sfx.push({ t: at, kind: "click" });
  };
  const cx = tc.x + tc.w * 0.55, cy = tc.y + RH * 0.5;
  // 0: cursor enters and clicks the first formula cell
  js.push(`tl.fromTo("#cur",{x:1500,y:900},{x:${r3(cx)},y:${r3(cy)},duration:1.2,ease:"power3.inOut"},.3);`);
  cap(0, 0.4, 2.7); // leaves before caption 1 arrives at 3.0 (outgoing leaves before incoming)
  click("rip1", cx, cy, 1.55);
  js.push(`tl.to("#sel",{opacity:1,duration:.01},1.55);`);
  camTo(cx, cy, 1.18, 1.7);
  // 1: type the formula (cell + formula bar), referenced cells light up
  const n = f0.length, tStart = 3.0, tDur = Math.max(1.2, n * 0.16);
  js.push(`tl.set("#edit",{opacity:1},${r3(tStart)});`);
  js.push(`tl.fromTo("#tpc",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:${r3(tDur)},ease:"steps(${n})"},${r3(tStart)});`);
  js.push(`tl.fromTo("#tpf",{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:${r3(tDur)},ease:"steps(${n})"},${r3(tStart)});`);
  for (let c = 0; c < n; c++) sfx.push({ t: tStart + (c / n) * tDur, kind: "key" });
  refs.forEach((_, k) => js.push(`tl.to("#ref${k}",{opacity:1,duration:.15},${r3(tStart + tDur * (0.35 + 0.4 * k))});`));
  cap(1, tStart, tStart + tDur + 1.2);
  // 2: enter -> value appears
  const tEnter = tStart + tDur + 0.6;
  js.push(`tl.set("#edit",{opacity:0},${r3(tEnter)});`);
  refs.forEach((_, k) => js.push(`tl.to("#ref${k}",{opacity:0,duration:.2},${r3(tEnter)});`));
  js.push(`tl.fromTo("#res0",{opacity:0,y:-10},{opacity:1,y:0,duration:.3,ease:"power2.out"},${r3(tEnter)});`);
  sfx.push({ t: tEnter, kind: "click" }, { t: tEnter + 0.05, kind: "pop" });
  // 3: drag the fill handle down, camera pulls back
  const hx = tc.x + tc.w + 2, hy = tc.y + RH + 2;
  const tDrag = tEnter + 1.0;
  cap(2, tDrag, null);
  js.push(`tl.to("#cur",{x:${r3(hx)},y:${r3(hy)},duration:.6,ease:"power2.inOut"},${r3(tDrag)});`);
  camTo(tc.x + tc.w / 2, tc.y + RH * spec.rows.length * 0.5, 1.08, tDrag + 0.4, 1.1);
  click("rip2", hx, hy, tDrag + 0.7);
  const rows = spec.rows.length, dragDur = 0.35 * rows;
  js.push(`tl.to("#cur",{y:${r3(hy + RH * (rows - 1))},duration:${r3(dragDur)},ease:"power1.inOut"},${r3(tDrag + 0.85)});`);
  js.push(`tl.set("#rng",{opacity:1},${r3(tDrag + 0.85)});`);
  js.push(`tl.fromTo("#rng",{scaleY:${r3(1 / rows)}},{scaleY:1,duration:${r3(dragDur)},ease:"power1.inOut"},${r3(tDrag + 0.85)});`);
  js.push(`tl.set("#sel",{opacity:0},${r3(tDrag + 0.85 + dragDur)});`);
  js.push(`tl.set("#selAll",{opacity:1},${r3(tDrag + 0.85 + dragDur)});`);
  for (let r = 1; r < rows; r++) {
    const at = tDrag + 0.85 + dragDur + 0.1 + r * 0.09;
    js.push(`tl.fromTo("#res${r}",{opacity:0,y:-10},{opacity:1,y:0,duration:.25,ease:"power2.out"},${r3(at)});`);
    sfx.push({ t: at, kind: "tick" });
  }
  const tEnd = tDrag + 0.85 + dragDur + 0.4 + rows * 0.09 + 1.8;
  ctx.duration = r3(tEnd);
  ctx.snapshots = [1.4, 2.8, tStart + tDur, tEnter + 0.6, tEnd - 0.4];
  html.push(`</div>`);
  void X0; void Y0; void colX;
}
