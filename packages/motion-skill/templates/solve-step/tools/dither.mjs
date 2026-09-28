// Halftone sprite baker: grayscale SVG -> 1-bit ordered-dither PNG.
// Runs once at build time in headless Chromium, so the composition only
// swaps finished images and stays seek-safe.
//
// usage: node dither.mjs <out-dir> [cell=4]
// env:   CHROME_PATH (defaults to the Playwright headless shell)

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tutorSVG, POSES } from "../character/tutor.mjs";

const outDir = process.argv[2] || "assets";
const cell = Number(process.argv[3] || 4);
const exe =
  process.env.CHROME_PATH ||
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage();

for (const pose of POSES) {
  const svg = tutorSVG(pose);
  const dataUrl = await page.evaluate(
    async ({ svg, cell }) => {
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      await img.decode();
      const W = img.width, H = img.height;
      const gw = Math.ceil(W / cell), gh = Math.ceil(H / cell);
      // Downsample: one sample per halftone cell.
      const small = new OffscreenCanvas(gw, gh);
      const sctx = small.getContext("2d");
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(img, 0, 0, gw, gh);
      const src = sctx.getImageData(0, 0, gw, gh).data;
      // 8x8 Bayer matrix gives the fine checker texture of the reference.
      const B = [
        0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
        12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
        3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
        15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
      ];
      const out = new OffscreenCanvas(gw * cell, gh * cell);
      const octx = out.getContext("2d");
      octx.fillStyle = "#000";
      const white = [];
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = (y * gw + x) * 4;
          const a = src[i + 3] / 255;
          if (a < 0.5) continue; // outside the silhouette stays transparent
          const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
          const t = (B[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
          if (lum < t) octx.fillRect(x * cell, y * cell, cell, cell);
          else white.push(x, y);
        }
      }
      // Paper-white inside the silhouette so overlapping elements are hidden.
      octx.globalCompositeOperation = "destination-over";
      octx.fillStyle = "#fff";
      for (let k = 0; k < white.length; k += 2) octx.fillRect(white[k] * cell, white[k + 1] * cell, cell, cell);
      const blob = await out.convertToBlob({ type: "image/png" });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let k = 0; k < buf.length; k++) bin += String.fromCharCode(buf[k]);
      return btoa(bin);
    },
    { svg, cell }
  );
  const file = join(outDir, `tutor-${pose.name}.png`);
  writeFileSync(file, Buffer.from(dataUrl, "base64"));
  console.log("baked", file);
}
await browser.close();
