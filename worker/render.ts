// Local render: npm run render -- examples/ecuacion-lineal.v2.json out/ecuacion [--no-render]
// Voice comes from VOICE_PROVIDER (estimate | elevenlabs | voicestudio).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { voiceFromEnv } from "@finalstudio/core/voice";
import { buildProject, renderProject } from "@finalstudio/core/render";

const [sbPath, outDir, flag] = process.argv.slice(2);
if (!sbPath || !outDir) {
  console.error("usage: npm run render -- <storyboard.v2.json> <out-dir> [--no-render]");
  process.exit(1);
}
const voice = voiceFromEnv();
let result = await buildProject(JSON.parse(readFileSync(sbPath, "utf8")), resolve(outDir), voice);
console.log(`✓ project ${result.projectDir} · ${result.duration}s · voice ${voice.name}`);
if (flag !== "--no-render") {
  result = await renderProject(result);
  console.log(`✓ ${result.mp4}`);
}
