// Render worker: claims queued jobs from Supabase, renders, uploads the MP4.
// Runs in the render container (Chromium + FFmpeg). Needs SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY, plus the voice provider's own variables.

import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

import { createClient } from "@supabase/supabase-js";

import { voiceFromEnv } from "@finalstudio/core/voice";
import { buildProject, renderProject } from "@finalstudio/core/render";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
const db = createClient(url, key, { auth: { persistSession: false } });
const voice = voiceFromEnv();

async function setStatus(id: string, status: string, progress: number, error?: string) {
  await db.from("render_jobs").update({ status, progress, error, updated_at: new Date().toISOString() }).eq("id", id);
}

async function handle(job: { id: string; owner: string; storyboard_id: string }) {
  const { data: sb, error } = await db.from("storyboards").select("doc").eq("id", job.storyboard_id).single();
  if (error) throw error;
  const dir = join(tmpdir(), `finalstudio-${job.id}`);
  await setStatus(job.id, "voice", 0.1);
  let result = await buildProject(sb.doc, dir, voice);
  await setStatus(job.id, "rendering", 0.4);
  result = await renderProject(result);
  const path = `${job.owner}/${job.id}.mp4`;
  const up = await db.storage.from("videos").upload(path, readFileSync(result.mp4!), { contentType: "video/mp4", upsert: true });
  if (up.error) throw up.error;
  await db.from("videos").insert({
    owner: job.owner,
    storyboard_id: job.storyboard_id,
    job_id: job.id,
    storage_path: path,
    duration: result.duration,
    chapters: result.chapters,
    voice_provider: result.voice.provider,
  });
  await setStatus(job.id, "done", 1);
}

for (;;) {
  const { data: job, error } = await db.rpc("claim_render_job");
  if (error) console.error(error);
  if (!job?.id) {
    await sleep(2000);
    continue;
  }
  console.log(`▶ job ${job.id}`);
  try {
    await handle(job);
    console.log(`✓ job ${job.id}`);
  } catch (e) {
    console.error(e);
    await setStatus(job.id, "failed", 0, String(e));
  }
}
