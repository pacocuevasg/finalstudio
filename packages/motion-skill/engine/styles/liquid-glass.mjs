// liquid-glass: frosted glass on a lavender-blue gradient. One glass shape
// springs from a button into a pill, an activity card and a stack of
// notifications, each state born from the previous one (iOS-style "liquid
// glass" launch videos, rebuilt). Use it for "what you learned today" cards.
// Facts: the ring and the "x of y" label come from the topics list.
import { esc, r3, inset, assertFact } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("inter").add("mono");
  const topics = spec.topics;
  const done = topics.filter((t) => t.done).length;
  assertFact(topics.length >= 3, "liquid-glass needs at least 3 topics for the notification stack");
  const pct = Math.round((done / topics.length) * 100);
  console.log(`✓ ${done} de ${topics.length} temas · ${pct}%`);
  const cx = W / 2, cy = H / 2;
  const box = (w, h, r, dy = 0) => ({ x: cx - w / 2, y: cy - h / 2 + dy, w, h, r });
  const S = [box(460, 116, 58, 60), box(620, 124, 62, -330), box(980, 440, 64, 0), box(860, 150, 44, -190)];
  const shrink = (b, d) => ({ x: b.x + d, y: b.y + d, w: b.w - 2 * d, h: b.h - 2 * d, r: Math.max(0, b.r - d) });
  css.push(`
#stage{position:absolute;inset:0;background:linear-gradient(135deg,#c9c3f5 0%,#a9b8f7 45%,#8fb3f0 100%);font-family:Inter,sans-serif;color:#1c1f3a;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.85}
#rim,#glass{position:absolute;inset:0}
#rim{background:linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.35) 40%,rgba(255,255,255,.7));clip-path:${inset(S[0], W, H)}}
#glass{background:linear-gradient(160deg,rgba(255,255,255,.55),rgba(255,255,255,.22));backdrop-filter:blur(28px) saturate(1.6);-webkit-backdrop-filter:blur(28px) saturate(1.6);clip-path:${inset(shrink(S[0], 2.5), W, H)}}
#shadow{position:absolute;left:0;top:0;border-radius:60px;box-shadow:0 40px 80px -30px rgba(40,40,120,.45)}
.st{position:absolute;opacity:0;display:flex;align-items:center;justify-content:center}
.b0{font-weight:700;font-size:40px;letter-spacing:-.02em}
.b1{font-weight:700;font-size:40px;gap:18px}
.b1 i{width:56px;height:56px;border-radius:50%;background:#1c1f3a;color:#fff;font:700 32px/56px Inter;text-align:center;font-style:normal}
.card{gap:56px}.card .ringw{position:relative;width:340px;height:340px;display:flex;align-items:center;justify-content:center}.card .ringw svg{position:absolute;left:0;top:0}
.card .lbl{font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;opacity:.6}
.card .n{font-weight:900;font-size:120px;letter-spacing:-.05em;line-height:1}
.ntf{position:absolute;display:flex;justify-content:flex-start;align-items:center;gap:26px;padding:0 40px;font-size:34px;font-weight:700;letter-spacing:-.01em}
.ntf .ic{width:70px;height:70px;border-radius:20px;background:#1c1f3a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:36px;flex:none}
.ntf small{display:block;font:500 22px "Plex Mono";opacity:.6;margin-top:6px;font-weight:500}
.gl{background:linear-gradient(160deg,rgba(255,255,255,.6),rgba(255,255,255,.25));backdrop-filter:blur(28px) saturate(1.6);-webkit-backdrop-filter:blur(28px) saturate(1.6);border:2.5px solid rgba(255,255,255,.8);border-radius:44px;box-shadow:0 30px 60px -30px rgba(40,40,120,.4)}
.cap{position:absolute;left:96px;top:80px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:rgba(28,31,58,.6)}
`);
  const at = (b, extra = "") => `left:${r3(b.x)}px;top:${r3(b.y)}px;width:${r3(b.w)}px;height:${r3(b.h)}px;${extra}`;
  const RR = 150, C = 2 * Math.PI * RR;
  // stack below state 3: the remaining topics as their own glass cards
  const rest = topics.slice(1, 3).map((t, k) => ({ t, b: { ...S[3], y: S[3].y + (k + 1) * 175 } }));
  html.push(`<div id="stage">
<div class="blob" id="bl0" style="left:180px;top:620px;width:620px;height:620px;background:#f6a7d8"></div>
<div class="blob" id="bl1" style="left:1240px;top:-120px;width:720px;height:720px;background:#7fd1f5"></div>
<div class="blob" id="bl2" style="left:980px;top:700px;width:520px;height:520px;background:#b69cff"></div>
<div class="cap">${esc(spec.kicker || "")}</div>
<div id="rim"></div><div id="glass"></div>
<div class="st b0" id="s0" style="${at(S[0])}">${esc(spec.button || "Terminar lección")}</div>
<div class="st b1" id="s1" style="${at(S[1])}"><i>✓</i>${done} de ${topics.length} ${esc(spec.unit || "temas")}</div>
<div class="st card" id="s2" style="${at(S[2])}"><div class="ringw"><svg width="340" height="340"><circle cx="170" cy="170" r="${RR}" fill="none" stroke="rgba(28,31,58,.12)" stroke-width="22"/><circle id="ring" cx="170" cy="170" r="${RR}" fill="none" stroke="#1c1f3a" stroke-width="22" stroke-linecap="round" stroke-dasharray="${r3(C)}" stroke-dashoffset="${r3(C)}" transform="rotate(-90 170 170)"/></svg><div class="n" style="font-size:96px">${pct}%</div></div>
  <div><div class="lbl">${esc(spec.cardLabel || "Hoy aprendiste")}</div><div style="font-size:52px;font-weight:900;letter-spacing:-.03em;margin-top:14px">${done} de ${topics.length} ${esc(spec.unit || "temas")}</div><div style="font-size:30px;font-weight:700;margin-top:10px;opacity:.7">${esc(spec.streak || "")}</div></div></div>
<div class="st ntf" id="s3" style="${at(S[3])}"><span class="ic">${esc(topics[0].icon || "1")}</span><span>${esc(topics[0].name)}<small>${esc(topics[0].note || "")}</small></span></div>
${rest.map((r, k) => `<div class="ntf gl" id="n${k}" style="${at(r.b)};opacity:0"><span class="ic">${esc(r.t.icon || k + 2)}</span><span>${esc(r.t.name)}<small>${esc(r.t.note || "")}</small></span></div>`).join("")}
</div>`);
  js.push(`tl.to("#bl0",{x:180,y:-120,duration:14,ease:"sine.inOut"},0);`);
  js.push(`tl.to("#bl1",{x:-220,y:160,duration:14,ease:"sine.inOut"},0);`);
  js.push(`tl.to("#bl2",{x:-300,y:-200,duration:14,ease:"sine.inOut"},0);`);
  js.push(`tl.to("#s0",{opacity:1,duration:.4},.3);`);
  const snaps = [1.3];
  let t = 0.3;
  const hold = spec.hold || 2.4;
  for (let i = 1; i < S.length; i++) {
    const tm = t + hold;
    js.push(`tl.to("#s${i - 1}",{opacity:0,duration:.16},${r3(tm)});`);
    js.push(`tl.to("#rim",{clipPath:"${inset(S[i], W, H)}",duration:.8,ease:"elastic.out(1,.75)"},${r3(tm)});`);
    js.push(`tl.to("#glass",{clipPath:"${inset(shrink(S[i], 2.5), W, H)}",duration:.8,ease:"elastic.out(1,.75)"},${r3(tm)});`);
    js.push(`tl.to("#s${i}",{opacity:1,duration:.3},${r3(tm + 0.35)});`);
    sfx.push({ t: tm, kind: "pop" });
    if (i === 2) {
      js.push(`tl.to("#ring",{strokeDashoffset:${r3(C * (1 - done / topics.length))},duration:1.1,ease:"power3.out"},${r3(tm + 0.4)});`);
      sfx.push({ t: tm + 1.4, kind: "ding" });
    }
    if (i === 3)
      rest.forEach((r, k) => {
        js.push(`tl.fromTo("#n${k}",{opacity:0,y:-120,scale:.9},{opacity:1,y:0,scale:1,duration:.7,ease:"elastic.out(1,.7)"},${r3(tm + 0.35 + k * 0.18)});`);
        sfx.push({ t: tm + 0.35 + k * 0.18, kind: "pop" });
      });
    t = tm;
    snaps.push(tm + 1.5);
  }
  ctx.duration = r3(t + 2.8);
  ctx.snapshots = snaps;
}
