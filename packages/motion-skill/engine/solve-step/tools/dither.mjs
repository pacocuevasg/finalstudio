// Halftone sprite baker: grayscale SVG (or a photo) -> 1-bit ordered-dither PNG.
// Runs once at build time in headless Chrome, so the composition only swaps
// finished images and stays seek-safe. No npm packages: it uses the skill's
// own pipe-based Chrome driver (scripts/lib/chrome.mjs).
//
// usage: node dither.mjs <out-dir> [cell=3] [character.mjs]      bake every pose of a character
//        node dither.mjs <out-dir> [cell=3] --image photo.jpg [name] [maxHeight=1100]
//                                                                 dither a photo (keep its alpha or white bg)

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { launch } from "../../../scripts/lib/chrome.mjs";

const [outDir = "assets", cellArg = "3", ...rest] = process.argv.slice(2);
const cell = Number(cellArg);
mkdirSync(outDir, { recursive: true });

let jobs;
if (rest[0] === "--image") {
  const file = resolve(rest[1]);
  const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[extname(file).toLowerCase()];
  const maxH = Number(rest[3] || 1100);
  const url = `data:${mime};base64,${readFileSync(file).toString("base64")}`;
  // Wrap the photo in an SVG with a levels curve so the dither has contrast.
  const svg = `data:image/svg+xml;charset=utf-8,` + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="${maxH}" width="${maxH}" viewBox="0 0 1 1" preserveAspectRatio="xMidYMax meet"><image href="${url}" width="1" height="1" preserveAspectRatio="xMidYMax meet"/></svg>`);
  jobs = [{ name: rest[2] || basename(file, extname(file)), svg }];
} else {
  const mod = await import(pathToFileURL(resolve(rest[0] || new URL("../character/tutor.mjs", import.meta.url).pathname)).href);
  jobs = mod.POSES.map((pose) => ({ name: `tutor-${pose.name}`, svg: mod.tutorSVG(pose) }));
}

const browser = await launch();
const page = await browser.newPage({ width: 400, height: 400 });
await page.goto("about:blank");
const bake = async ({ svg, cell }) => {
      const img = new Image();
      img.src = svg.startsWith("data:") ? svg : "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
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
    };
for (const job of jobs) {
  const b64 = await page.eval(`(${bake})(${JSON.stringify({ svg: job.svg, cell })})`);
  const file = join(outDir, `${job.name}.png`);
  writeFileSync(file, Buffer.from(b64, "base64"));
  console.log("baked", file);
}
await browser.close();
