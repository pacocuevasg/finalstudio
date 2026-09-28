// Grayscale "soft 3D" tutor, modelled on the look of @achxvi's Pocketsflow
// video: no outlines, volume comes only from light and shadow, a dense curly
// crown where every curl is lit from the top-left, heavy brows, glossy eyes.
// The dither tool turns it into the 1-bit halftone. Each call returns one pose
// as an SVG string (1000x1125). Poses differ only in mouth and eyes.

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Curls: dense crown plus side volume, painted back-to-front so lower curls
// overlap upper ones and read as a mass of small lit bumps.
function hairCurls() {
  const r = rng(11);
  const curls = [];
  for (let i = 0; i < 260; i++) {
    const a = Math.PI * (0.92 + 1.16 * r());
    const rad = 150 + r() * 120;
    let x = 512 + Math.cos(a) * rad * 1.0;
    let y = 470 + Math.sin(a) * rad * 0.95;
    if (y > 520) y = 520 - r() * 40; // sides stop above the ears
    curls.push({ x, y, s: 26 + r() * 22 });
  }
  // fringe falling onto the forehead
  for (let i = 0; i < 22; i++) curls.push({ x: 330 + r() * 330, y: 330 + r() * 40, s: 24 + r() * 16 });
  curls.sort((a, b) => a.y - b.y);
  return curls;
}
const CURLS = hairCurls();

export function tutorSVG({ mouth = "closed", eyes = "open" } = {}) {
  const hair = CURLS.map(
    (c) => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.s.toFixed(1)}" fill="url(#curl)"/>`
  ).join("");

  const L = { x: 432, y: 548 }, R = { x: 590, y: 548 };
  const eye = (e) =>
    eyes === "blink"
      ? `<path d="M${e.x - 28} ${e.y + 2} Q${e.x} ${e.y + 14} ${e.x + 28} ${e.y + 2}" stroke="#050505" stroke-width="9" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${e.x}" cy="${e.y}" rx="27" ry="31" fill="#050505"/>
         <ellipse cx="${e.x + 9}" cy="${e.y - 11}" rx="10" ry="11" fill="#fff"/>
         <circle cx="${e.x - 9}" cy="${e.y + 13}" r="3.5" fill="#ddd"/>`;

  const mouths = {
    closed: `<path d="M468 668 Q512 690 556 666" stroke="#141414" stroke-width="10" fill="none" stroke-linecap="round"/>
             <ellipse cx="512" cy="700" rx="30" ry="8" fill="#9a9a9a" filter="url(#soft)" opacity=".7"/>`,
    mid: `<path d="M472 662 Q512 660 552 662 Q545 700 512 702 Q479 700 472 662 Z" fill="#141414"/>
          <ellipse cx="512" cy="690" rx="20" ry="7" fill="#7a7a7a"/>`,
    open: `<path d="M466 656 Q512 652 558 656 Q550 722 512 724 Q474 722 466 656 Z" fill="#141414"/>
           <ellipse cx="512" cy="706" rx="26" ry="10" fill="#7a7a7a"/>
           <rect x="484" y="656" width="56" height="10" rx="4" fill="#e8e8e8"/>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1125" viewBox="0 0 1000 1125">
  <defs>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="softer" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <radialGradient id="skin" cx="34%" cy="34%" r="80%">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ffffff"/>
      <stop offset=".8" stop-color="#dcdcdc"/><stop offset="1" stop-color="#8c8c8c"/>
    </radialGradient>
    <radialGradient id="curl" cx="32%" cy="28%" r="78%">
      <stop offset="0" stop-color="#e6e6e6"/><stop offset=".22" stop-color="#6a6a6a"/>
      <stop offset=".55" stop-color="#161616"/><stop offset="1" stop-color="#000"/>
    </radialGradient>
    <radialGradient id="ear" cx="35%" cy="40%" r="70%">
      <stop offset="0" stop-color="#eee"/><stop offset="1" stop-color="#8a8a8a"/>
    </radialGradient>
    <linearGradient id="neck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3a3a"/><stop offset=".6" stop-color="#8a8a8a"/><stop offset="1" stop-color="#b0b0b0"/>
    </linearGradient>
    <radialGradient id="sweater" cx="30%" cy="10%" r="95%">
      <stop offset="0" stop-color="#d8d8d8"/><stop offset=".5" stop-color="#9c9c9c"/><stop offset="1" stop-color="#3a3a3a"/>
    </radialGradient>
    <clipPath id="face"><ellipse cx="512" cy="560" rx="200" ry="222"/></clipPath>
  </defs>

  <!-- body -->
  <path d="M40 1125 C60 940 200 862 380 842 L640 842 C820 862 950 940 975 1125 Z" fill="url(#sweater)"/>
  <path d="M250 1125 C262 1010 300 950 330 925" stroke="#555" stroke-width="16" fill="none" opacity=".5" filter="url(#soft)"/>
  <path d="M760 1125 C752 1010 720 950 690 925" stroke="#222" stroke-width="22" fill="none" opacity=".5" filter="url(#soft)"/>
  <path d="M378 846 C420 905 604 905 646 846 L646 872 C604 935 420 935 378 872 Z" fill="#6a6a6a"/>
  <rect x="428" y="700" width="168" height="170" rx="40" fill="url(#neck)"/>

  <!-- ears -->
  <ellipse cx="316" cy="590" rx="40" ry="56" fill="url(#ear)"/>
  <ellipse cx="708" cy="590" rx="40" ry="56" fill="url(#ear)"/>

  <!-- head with soft form shadows -->
  <ellipse cx="512" cy="560" rx="200" ry="222" fill="url(#skin)"/>
  <g clip-path="url(#face)">
    <ellipse cx="700" cy="640" rx="80" ry="200" fill="#6e6e6e" opacity=".45" filter="url(#softer)"/>
    <ellipse cx="512" cy="820" rx="220" ry="70" fill="#6e6e6e" opacity=".6" filter="url(#softer)"/>
    <ellipse cx="512" cy="400" rx="230" ry="70" fill="#2a2a2a" opacity=".55" filter="url(#softer)"/>
    <ellipse cx="400" cy="630" rx="46" ry="26" fill="#e4e4e4" filter="url(#soft)"/>
    <ellipse cx="628" cy="630" rx="46" ry="26" fill="#c4c4c4" filter="url(#soft)"/>
    <!-- nose: just a shadow and a highlight -->
    <ellipse cx="530" cy="612" rx="18" ry="12" fill="#9a9a9a" filter="url(#soft)"/>
    <ellipse cx="508" cy="596" rx="10" ry="7" fill="#fff" filter="url(#soft)"/>
  </g>

  ${hair}

  <!-- brows: heavy flat bars like the reference -->
  <rect x="392" y="470" width="84" height="18" rx="6" fill="#050505"/>
  <rect x="550" y="468" width="84" height="18" rx="6" fill="#050505"/>
  ${eye(L)}${eye(R)}
  ${mouths[mouth]}
</svg>`;
}

export const POSES = [
  { name: "closed", mouth: "closed", eyes: "open" },
  { name: "mid", mouth: "mid", eyes: "open" },
  { name: "open", mouth: "open", eyes: "open" },
  { name: "blink", mouth: "closed", eyes: "blink" },
];
