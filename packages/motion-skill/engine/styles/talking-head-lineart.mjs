// talking-head-lineart: the teacher sits in a circle bottom-right while the
// main frame draws one line-art sketch per sentence, exactly when it is said,
// with word-by-word captions. In production the circle holds the teacher's own
// recording and the word times come from the transcript; this preview uses a
// drawn stand-in presenter and times spread evenly over each sentence.
import { esc, r3 } from "../lib.mjs";

const ART = {
  sun: `<circle cx="0" cy="0" r="70"/>${Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return `<line x1="${r3(Math.cos(a) * 95)}" y1="${r3(Math.sin(a) * 95)}" x2="${r3(Math.cos(a) * 135)}" y2="${r3(Math.sin(a) * 135)}"/>`; }).join("")}`,
  sea: [0, 1, 2].map((k) => `<path d="M -300 ${k * 40} q 50 -30 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0"/>`).join(""),
  steam: [-80, 0, 80].map((x) => `<path d="M ${x} 120 c -30 -40 30 -80 0 -120 c -30 -40 30 -80 0 -120"/><path d="M ${x - 16} -100 L ${x} -130 L ${x + 16} -100"/>`).join(""),
  cloud: `<path d="M -170 40 C -230 40 -230 -40 -160 -40 C -160 -110 -60 -120 -40 -70 C -10 -140 110 -120 110 -50 C 190 -60 200 40 130 40 Z"/>`,
  rain: Array.from({ length: 9 }, (_, k) => `<line x1="${-160 + k * 40}" y1="${70 + (k % 2) * 20}" x2="${-180 + k * 40}" y2="${130 + (k % 2) * 20}"/>`).join(""),
  river: `<path d="M -260 -120 C -120 -120 -160 0 -20 0 C 120 0 80 110 260 110"/><path d="M -260 -80 C -140 -80 -170 40 -20 40 C 110 40 70 150 260 150"/><path d="M 222 104 L 264 130 L 222 156"/>`,
};

export function build(spec, ctx) {
  const { W, H, css, html, js, sfx } = ctx;
  ctx.fonts.add("inter").add("hand").add("mono");
  const P = { paper: "#fbfaf6", ink: "#1b1b1b", accent: "#2d6cf6", ...(spec.palette || {}) };
  css.push(`
#stage{position:absolute;inset:0;background:${P.paper};overflow:hidden}
.sk{position:absolute;left:0;top:0;overflow:visible;opacity:0}
.sk g > *{stroke-dasharray:1;stroke-dashoffset:1}
.sk *{fill:none;stroke:${P.ink};stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.sk .ac *{stroke:${P.accent}}
.lab{position:absolute;font:700 60px Caveat;color:${P.ink};opacity:0}
#cam{position:absolute;right:70px;bottom:70px;width:330px;height:330px;border-radius:50%;background:#e9edf5;border:8px solid #fff;box-shadow:0 20px 40px -20px rgba(0,0,0,.45);overflow:hidden}
#cam svg *{fill:none;stroke:#2a2f3a;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.cap{position:absolute;left:0;right:430px;bottom:90px;text-align:center;font:700 52px/1.2 Inter;letter-spacing:-.01em;color:#b9bcc4}
.cap span{display:inline-block;margin:0 .12em}
.rec{position:absolute;left:96px;top:70px;font:500 22px "Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#8a8e98}
`);
  const lines = spec.lines;
  let cur = 0.6;
  const timed = lines.map((l) => {
    const ws = l.say.split(/\s+/);
    const dur = l.dur || Math.max(2.6, ws.length * 0.36);
    const o = { ...l, ws, at: cur, dur };
    cur += dur + 0.25;
    return o;
  });
  const sk = timed.map((l, i) => `<svg class="sk" id="k${i}" width="${W}" height="${H}">${l.art.map((a, j) => `<g transform="translate(${a.x} ${a.y}) scale(${a.s || 1})" class="${a.accent ? "ac" : ""}">${ART[a.kind].replace(/<(path|line|circle|ellipse) /g, '<$1 pathLength="1" ')}</g>`).join("")}</svg>${(l.labels || []).map((b, j) => `<div class="lab" id="k${i}l${j}" style="left:${b.x}px;top:${b.y}px">${esc(b.text)}</div>`).join("")}`).join("");
  const caps = timed.map((l, i) => `<div class="cap" id="c${i}" style="opacity:0">${l.ws.map((w, j) => `<span id="c${i}w${j}">${esc(w)}</span>`).join("")}</div>`).join("");
  // stand-in presenter: head, shoulders, a mouth that opens while talking
  const cam = `<div id="cam"><svg width="330" height="330" viewBox="0 0 330 330"><path d="M 40 330 C 50 250 110 230 165 230 C 220 230 280 250 290 330"/><circle cx="165" cy="140" r="70"/><path d="M 100 120 C 110 60 220 60 230 120"/><circle cx="140" cy="140" r="4"/><circle cx="190" cy="140" r="4"/><g id="mouth"><path d="M 148 178 Q 165 188 182 178"/></g><ellipse id="mo" cx="165" cy="180" rx="14" ry="9" style="opacity:0"/></svg></div>`;
  html.push(`<div id="stage"><div class="rec">${esc(spec.kicker || "")}</div>${sk}${caps}${cam}</div>`);
  const snaps = [];
  const talk = [];
  timed.forEach((l, i) => {
    js.push(`tl.set("#k${i}",{opacity:1},${r3(l.at)});`);
    // prepare every stroke for tracing
    const per = (l.dur * 0.7) / l.art.length;
    l.art.forEach((a, j) => js.push(`tl.to("#k${i} g:nth-of-type(${j + 1}) > *",{strokeDashoffset:0,duration:${r3(per)},stagger:${r3(per / 12)},ease:"power1.inOut"},${r3(l.at + j * per)});`));
    (l.labels || []).forEach((b, j) => js.push(`tl.to("#k${i}l${j}",{opacity:1,duration:.3},${r3(l.at + l.dur * 0.6 + j * 0.2)});`));
    sfx.push({ t: l.at, kind: "scribble", len: l.dur * 0.7 });
    js.push(`tl.set("#c${i}",{opacity:1},${r3(l.at)});`);
    const wd = l.dur / l.ws.length;
    l.ws.forEach((w, j) => {
      js.push(`tl.set("#c${i}w${j}",{color:"${P.ink}"},${r3(l.at + j * wd)});`);
      // mouth flaps on every syllable-ish beat
      talk.push(`tl.set("#mo",{opacity:1},${r3(l.at + j * wd)});tl.set("#mo",{opacity:0},${r3(l.at + j * wd + wd * 0.55)});`);
    });
    snaps.push(l.at + l.dur - 0.2);
    if (i < timed.length - 1) {
      js.push(`tl.to("#k${i}",{opacity:0,duration:.25},${r3(l.at + l.dur)});`);
      (l.labels || []).forEach((b, j) => js.push(`tl.to("#k${i}l${j}",{opacity:0,duration:.25},${r3(l.at + l.dur)});`));
      js.push(`tl.set("#c${i}",{opacity:0},${r3(l.at + l.dur + 0.2)});`);
    }
  });
  js.push(talk.join(""));
  ctx.duration = r3(cur + 1);
  ctx.snapshots = snaps;
}
