// storyboard v2 -> voice -> timeline -> HyperFrames project -> MP4.
// Runs in the render worker (container with Chromium + FFmpeg), never in the web app.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Storyboard } from "./storyboard.ts";
import { compileTimeline, sceneScripts, toVtt, type Chapter } from "./timeline.ts";
import { verifyStoryboard } from "./verify.ts";
import type { VoiceClip, VoiceProvider } from "./voice/types.ts";

export const SKILL_DIR = process.env.FINALSTUDIO_SKILL_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../motion-skill");

export type RenderResult = {
  projectDir: string;
  mp4: string | null;
  duration: number;
  chapters: Chapter[];
  voice: { provider: string; nativeTimings: boolean };
};

function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env): Promise<void> {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, args, { cwd, env, stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? ok() : fail(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
    p.on("error", fail);
  });
}

export async function buildProject(input: unknown, projectDir: string, voice: VoiceProvider, skillDir = SKILL_DIR): Promise<RenderResult> {
  const sb = Storyboard.parse(input);
  const check = verifyStoryboard(sb);
  if (!check.ok) throw new Error(`math check failed on "${check.line}": ${check.left} ≠ ${check.right}`);

  mkdirSync(join(projectDir, "assets", "voice"), { recursive: true });

  // One audio per scene, generated before any timing is decided.
  const clips: VoiceClip[] = [];
  for (const [i, text] of sceneScripts(sb).entries()) clips.push(await voice.synthesize(text, { language: sb.language }));

  const { builder, chapters } = compileTimeline(sb, clips, (i, clip) => {
    if (!clip.audio.length) return null;
    const rel = `assets/voice/scene-${String(i + 1).padStart(2, "0")}.${clip.ext}`;
    writeFileSync(join(projectDir, rel), clip.audio);
    return rel;
  });
  writeFileSync(join(projectDir, "storyboard.v2.json"), JSON.stringify(sb, null, 2));
  writeFileSync(join(projectDir, "storyboard.json"), JSON.stringify(builder, null, 2));
  writeFileSync(join(projectDir, "chapters.json"), JSON.stringify(chapters, null, 2));
  writeFileSync(join(projectDir, "captions.vtt"), toVtt(builder));
  // The skill's engine copies GSAP, fonts and the tutor sprites and writes index.html.
  await run(process.execPath, [join(skillDir, "engine/build.mjs"), "storyboard.json", "."], projectDir);

  return {
    projectDir,
    mp4: null,
    duration: builder.duration,
    chapters,
    voice: { provider: voice.name, nativeTimings: voice.nativeTimings },
  };
}

export async function renderProject(result: RenderResult, name = "video.mp4", skillDir = SKILL_DIR): Promise<RenderResult> {
  // The skill's own renderer: headless Chrome + FFmpeg, no npm package or download.
  // Chrome comes from MOTION_CHROME or is found on the machine (scripts/doctor.mjs).
  mkdirSync(join(result.projectDir, "renders"), { recursive: true });
  const mp4 = join(result.projectDir, "renders", name);
  await run(process.execPath, [join(skillDir, "scripts/render.mjs"), ".", "-o", mp4], result.projectDir);
  return { ...result, mp4 };
}
