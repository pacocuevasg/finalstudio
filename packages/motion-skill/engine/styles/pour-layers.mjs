// pour-layers: an empty glass fills one ingredient at a time, each with its
// name and measure (Ror_Fly's Negroni recipe explainer, generalised). Works for
// recipes, mixtures, and science demos like a density column. With
// `orderBy: "density"` the build fails unless every layer is lighter than the
// one below it.
import { esc, r3, assertFact } from "../lib.mjs";

export function build(spec, ctx) {
  const P = { bg: "#eef1f5", ink: "#18202e", dim: "#7d8799", glass: "#ffffff", accent: "#2f6df6", ...(spec.palette || {}) };
  ctx.fonts.add("inter").add("serif").add("mono");
  const { css, html, js, sfx } = ctx;
  const items = spec.items;
  if (spec.orderBy === "density")
    for (let i = 1; i < items.length; i++)
      assertFact(items[i].density < items[i - 1].density, `${items[i].name} (${items[i].density}) must be lighter than ${items[i - 1].name} (${items[i - 1].density})`);
  const total = items.reduce((a, it) => a + it.amount, 0);
  if (spec.capacity) assertFact(total <= spec.capacity, `layers add up to ${total} ${spec.unit}, more than the ${spec.capacity} ${spec.unit} glass`);
  console.log(`✓ layers: ${items.map((i) => i.name).join(" < ")} · ${total} ${spec.unit || ""}`);

  const GL = { x: 1060, y: 170, w: 360, h: 760 }; // glass inner box
  const fillH = GL.h - 40;
  const cap = spec.capacity || total;
  css.push(`
#stage{position:absolute;inset:0;background:${P.bg};color:${P.ink};font-family:Inter,sans-serif}
.kick{position:absolute;left:120px;top:90px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:${P.dim}}
.ttl{position:absolute;left:120px;top:130px;font:italic 400 92px/1 "Instrument Serif"}
.list{position:absolute;left:120px;top:300px;width:720px}
.it{display:flex;align-items:center;gap:22px;height:96px;border-bottom:1px solid #d8dde6;opacity:.28}
.it .sw{width:30px;height:30px;border-radius:50%;flex:none}
.it .nm{font-weight:700;font-size:40px;letter-spacing:-.02em;flex:1}
.it .am{font:500 28px "Plex Mono";color:${P.dim}}
.it .ck{width:40px;height:40px;border-radius:50%;background:${P.ink};color:#fff;font:700 24px/40px Inter;text-align:center;transform:scale(0)}
#glass{position:absolute;left:${GL.x}px;top:${GL.y}px;width:${GL.w}px;height:${GL.h}px;border-radius:0 0 60px 60px;overflow:hidden;background:rgba(255,255,255,.45)}
.lay{position:absolute;left:0;right:0;transform-origin:50% 100%;transform:scaleY(0)}
.lay::after{content:"";position:absolute;left:0;right:0;top:0;height:10px;background:rgba(255,255,255,.35)}
#rim{position:absolute;left:${GL.x - 14}px;top:${GL.y - 20}px;width:${GL.w + 28}px;height:${GL.h + 34}px;border:14px solid ${P.glass};border-top:none;border-radius:0 0 74px 74px;box-shadow:0 40px 80px -40px rgba(20,30,60,.35),inset 0 0 0 2px rgba(20,30,60,.06)}
#shine{position:absolute;left:${GL.x + 40}px;top:${GL.y + 30}px;width:26px;height:${GL.h - 120}px;border-radius:13px;background:rgba(255,255,255,.55)}
.stream{position:absolute;left:${GL.x + GL.w / 2 - 14}px;top:0;width:28px;border-radius:14px;transform-origin:50% 0;transform:scaleY(0)}
.tag{position:absolute;left:${GL.x + GL.w + 70}px;font-weight:700;font-size:34px;white-space:nowrap;opacity:0}
.tag small{display:block;font:500 22px "Plex Mono";color:${P.dim};margin-top:4px}
.tag:before{content:"";position:absolute;left:-58px;top:22px;width:44px;height:3px;background:${P.ink}}
.done{position:absolute;left:120px;top:880px;font:900 64px Inter;letter-spacing:-.03em;opacity:0}
.done i{font:italic 400 1.1em "Instrument Serif";color:${P.accent}}
`);
  let y = GL.h; // stacking from the bottom
  let t = 1.0;
  const lays = [], tags = [], list = [], streams = [];
  const snaps = [];
  items.forEach((it, k) => {
    const h = (it.amount / cap) * fillH;
    y -= h;
    lays.push(`<div class="lay" id="ly${k}" style="top:${r3(y)}px;height:${r3(h + 2)}px;background:${it.color}"></div>`);
    tags.push(`<div class="tag" id="tg${k}" style="top:${r3(GL.y + y + h / 2 - 30)}px">${esc(it.name)}<small>${esc(it.note || "")}</small></div>`);
    list.push(`<div class="it" id="it${k}"><span class="sw" style="background:${it.color}"></span><span class="nm">${esc(it.name)}</span><span class="am">${esc(`${it.amount} ${spec.unit || ""}`)}</span><span class="ck" id="ck${k}">✓</span></div>`);
    streams.push(`<div class="stream" id="st${k}" style="height:${r3(GL.y + y + h)}px;background:${it.color}"></div>`);
    const pour = Math.max(1.0, 1.6 * (it.amount / (total / items.length)));
    js.push(`tl.to("#it${k}",{opacity:1,duration:.25},${r3(t)});`);
    js.push(`tl.fromTo("#st${k}",{scaleY:0},{scaleY:1,duration:.25,ease:"power2.in"},${r3(t + 0.2)});`);
    js.push(`tl.to("#ly${k}",{scaleY:1,duration:${r3(pour)},ease:"power1.inOut"},${r3(t + 0.4)});`);
    js.push(`tl.to("#st${k}",{scaleY:0,transformOrigin:"50% 100%",duration:.25,ease:"power2.out"},${r3(t + 0.4 + pour)});`);
    js.push(`tl.fromTo("#tg${k}",{opacity:0,x:-20},{opacity:1,x:0,duration:.4,ease:"power3.out"},${r3(t + 0.5 + pour * 0.5)});`);
    js.push(`tl.to("#ck${k}",{scale:1,duration:.3,ease:"back.out(3)"},${r3(t + 0.5 + pour)});`);
    sfx.push({ t: t + 0.25, kind: "pour", len: pour + 0.2 }, { t: t + 0.5 + pour, kind: "pop" });
    snaps.push(t + 0.4 + pour * 0.6);
    t += 0.9 + pour;
  });
  html.push(`<div id="stage"><div class="kick">${esc(spec.kicker || "")}</div><div class="ttl">${esc(spec.title)}</div><div class="list">${list.join("")}</div>
${streams.join("")}<div id="glass">${lays.join("")}</div><div id="rim"></div><div id="shine"></div>${tags.join("")}
<div class="done" id="done">${spec.doneText ? esc(spec.doneText).replace(/\*([^*]+)\*/g, "<i>$1</i>") : ""}</div></div>`);
  js.push(`tl.fromTo("#done",{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},${r3(t)});`);
  sfx.push({ t, kind: "ding" });
  ctx.duration = r3(t + 2.4);
  ctx.snapshots = [...snaps, t + 1.5];
}
