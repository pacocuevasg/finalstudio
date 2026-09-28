// storyboard v2 -> voice -> timeline -> HyperFrames project -> MP4.
// Runs in the render worker (container with Chromium + FFmpeg), never in the web app.

import { spawn } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Storyboard } from "./storyboard.ts";
import { compileTimeline, sceneScripts, toVtt, type Chapter } from "./timeline.ts";
import { verifyStoryboard } from "./verify.ts";
import type { VoiceClip, VoiceProvider } from "./voice/types.ts";

export const SKILL_DIR = process.env.FINALSTUDIO_SKILL_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../motion-skill");
const HYPERFRAMES = "hyperframes@0.8.86";

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
  cpSync(join(skillDir, "assets"), join(projectDir, "assets"), { recursive: true });
  copyFileSync(join(skillDir, "templates/solve-step/hyperframes.json"), join(projectDir, "hyperframes.json"));

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
  await run(process.execPath, [join(skillDir, "templates/solve-step/build.mjs"), "storyboard.json", "."], projectDir);

  return {
    projectDir,
    mp4: null,
    duration: builder.duration,
    chapters,
    voice: { provider: voice.name, nativeTimings: voice.nativeTimings },
  };
}

export async function renderProject(result: RenderResult, name = "video.mp4"): Promise<RenderResult> {
  const env = { ...process.env };
  const shell = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
  if (!env.HYPERFRAMES_BROWSER_PATH && existsSync(shell)) env.HYPERFRAMES_BROWSER_PATH = shell;
  mkdirSync(join(result.projectDir, "renders"), { recursive: true });
  const mp4 = join(result.projectDir, "renders", name);
  await run("npx", ["--yes", HYPERFRAMES, "render", "-q", "delivery", "-o", mp4], result.projectDir, env);
  return { ...result, mp4 };
}
