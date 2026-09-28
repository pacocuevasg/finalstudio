// card-wall-3d: black void, two walls of vertical cards in 3D, the camera
// flies down the corridor and lands on one card, which flips to reveal its
// answer. Built for vocabulary and flashcard reviews. Card order and colours
// come from a seeded PRNG so every render is the same.
import { esc, r3, rng, assertFact } from "../lib.mjs";

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("inter").add("mono").add("serif");
  const R = rng(spec.seed || 21);
  const deck = spec.cards;
  const target = spec.target;
  assertFact(deck.some((c) => c.front === target.front), `target "${target.front}" must be one of the cards`);
  const cols = spec.depth || 14, rows = 3, gap = 300, CW = 220, CH = 300, half = 560;
  const tint = ["#1b1b1f", "#222228", "#26262d", "#1f2330"];
  css.push(`
#stage{position:absolute;inset:0;background:#000;overflow:hidden;perspective:1100px;perspective-origin:50% 50%}
#world{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}
.cd{position:absolute;left:${-CW / 2}px;top:${-CH / 2}px;width:${CW}px;height:${CH}px;border-radius:18px;border:1px solid rgba(255,255,255,.1);color:#f2f2f2;display:flex;flex-direction:column;justify-content:space-between;padding:18px 20px;backface-visibility:hidden}
.cd b{font:500 13px "Plex Mono";letter-spacing:.14em;opacity:.5}
.cd span{font:700 30px/1.05 Inter;letter-spacing:-.02em}
#tg{position:absolute;left:${-CW / 2}px;top:${-CH / 2}px;width:${CW}px;height:${CH}px;transform-style:preserve-3d}
#tg .f,#tg .k{position:absolute;inset:0;border-radius:18px;display:flex;flex-direction:column;justify-content:space-between;padding:18px 20px;backface-visibility:hidden}
#tg .f{background:#f4f1ea;color:#111}
#tg .k{background:#ff5b2e;color:#fff;transform:rotateY(180deg)}
#tg b{font:500 13px "Plex Mono";letter-spacing:.14em;opacity:.6}
#tg span{font:700 34px/1.05 Inter;letter-spacing:-.02em}
#tg i{font:italic 400 44px/1 "Instrument Serif"}
.cap{position:absolute;left:96px;top:80px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#8a8a92;z-index:3}
.big{position:absolute;left:0;right:0;bottom:110px;text-align:center;font:italic 400 64px "Instrument Serif";color:#fff;opacity:0;z-index:3}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.85) 100%);z-index:2}
`);
  const cards = [];
  let n = 0;
  for (const side of [-1, 1])
    for (let c = 0; c < cols + 5; c++)
      for (let r = 0; r < rows; r++) {
        const card = deck[Math.floor(R() * deck.length)];
        const z = -c * gap - 200;
        const y = (r - 1) * (CH + 40);
        cards.push(`<div class="cd" id="cd${n}" style="background:${tint[Math.floor(R() * tint.length)]};transform:translate3d(${side * half}px,${y}px,${z}px) rotateY(${-side * 90}deg);opacity:0"><b>${String(n + 1).padStart(3, "0")}</b><span>${esc(card.front)}</span></div>`);
        n++;
      }
  const endZ = -cols * gap - 400;
  html.push(`<div id="stage"><div id="world">${cards.join("")}
<div id="tgw" style="transform:translate3d(0px,0px,${endZ}px)"><div id="tg"><div class="f"><b>${esc(spec.deckName || "")}</b><span>${esc(target.front)}</span></div><div class="k"><b>${esc(spec.answerLabel || "significa")}</b><i>${esc(target.back)}</i></div></div></div>
</div><div id="vig"></div><div class="cap">${esc(spec.kicker || "")}</div><div class="big" id="big">${esc((spec.caption || "").replace("{n}", n + 1))}</div></div>`);
  // grid appears (0–3 s), near cards first
  const per = (cols + 5) * rows;
  const appear = Array.from({ length: n }, (_, k) => `tl.to("#cd${k}",{opacity:1,duration:.4},${r3(0.2 + ((k % per) / per) * 2.2 + R() * 0.2)});`);
  js.push(appear.join(""));
  js.push(`tl.set("#world",{z:0},0);`);
  sfx.push({ t: 0.2, kind: "whoosh" });
  // fly down the corridor, with a slow roll for life
  const fly0 = 3, fly1 = fly0 + (spec.fly || 7);
  const land = -endZ + 450; // stop with the target card in front of the lens
  js.push(`tl.to("#world",{z:${land},duration:${fly1 - fly0},ease:"power2.inOut"},${fly0});`);
  js.push(`tl.fromTo("#world",{rotationZ:0},{rotationZ:-2,duration:${(fly1 - fly0) / 2},ease:"sine.inOut",yoyo:true,repeat:1},${fly0});`);
  sfx.push({ t: fly0, kind: "whoosh" }, { t: fly0 + 2, kind: "whoosh" }, { t: fly1 - 0.8, kind: "whoosh" });
  // flip
  js.push(`tl.to("#tg",{rotationY:180,duration:.9,ease:"back.inOut(1.4)"},${r3(fly1 + 0.9)});`);
  js.push(`tl.to("#big",{opacity:1,duration:.6},${r3(fly1 + 1.6)});`);
  sfx.push({ t: fly1 + 0.9, kind: "pop" }, { t: fly1 + 1.5, kind: "ding" });
  ctx.duration = r3(fly1 + 3.8);
  ctx.snapshots = [2.4, fly0 + 2.5, fly1 - 1.5, fly1 + 0.5, fly1 + 2.6];
}
