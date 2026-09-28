// Local render jobs for development: renders in this Node process and keeps
// state in memory. Production uses the Supabase queue (worker/queue.ts).

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import type { Chapter } from "@finalstudio/core";
import { voiceFromEnv } from "@finalstudio/core/voice";
import { buildProject, renderProject } from "@finalstudio/core/render";

export type Job = {
  id: string;
  status: "queued" | "building" | "rendering" | "done" | "failed";
  progress: number;
  dir: string;
  mp4?: string;
  duration?: number;
  chapters?: Chapter[];
  voice?: string;
  error?: string;
};

const g = globalThis as unknown as { __fsJobs?: Map<string, Job> };
const jobs = (g.__fsJobs ??= new Map());
const ROOT = resolve(process.env.RENDER_DIR ?? join(process.cwd(), "../../out/jobs"));

export const getJob = (id: string) => jobs.get(id);

export function startJob(storyboard: unknown): Job {
  const id = randomUUID();
  const dir = join(ROOT, id);
  mkdirSync(dir, { recursive: true });
  const job: Job = { id, status: "queued", progress: 0, dir };
  jobs.set(id, job);
  void (async () => {
    try {
      job.status = "building";
      job.progress = 0.1;
      const built = await buildProject(storyboard, dir, voiceFromEnv(), join(process.cwd(), "../../packages/motion-skill"));
      Object.assign(job, { status: "rendering", progress: 0.4, duration: built.duration, chapters: built.chapters, voice: built.voice.provider });
      const done = await renderProject(built, "video.mp4", join(process.cwd(), "../../packages/motion-skill"));
      Object.assign(job, { status: "done", progress: 1, mp4: done.mp4 });
    } catch (e) {
      Object.assign(job, { status: "failed", error: e instanceof Error ? e.message : String(e) });
    }
  })();
  return job;
}
