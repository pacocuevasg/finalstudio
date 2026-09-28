import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Storyboard, verifyStoryboard } from "@finalstudio/core";
import { loadSkillGuide, planStoryboard } from "@finalstudio/core/planner";

export const runtime = "nodejs";
export const maxDuration = 300;

const REPO = join(process.cwd(), "../..");

export async function POST(req: Request) {
  const { exercise, settings } = (await req.json()) as {
    exercise?: string;
    settings?: { level?: string; language?: string; mode?: string };
  };
  if (!exercise?.trim()) return Response.json({ error: "falta el ejercicio" }, { status: 400 });

  // Without an API key the app still runs end to end on the bundled example.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    const storyboard = Storyboard.parse(JSON.parse(readFileSync(join(REPO, "examples/ecuacion-lineal.v2.json"), "utf8")));
    return Response.json({ storyboard, verified: verifyStoryboard(storyboard).ok, demo: true });
  }
  try {
    const storyboard = await planStoryboard({
      exercise,
      level: settings?.level,
      language: settings?.language,
      mode: settings?.mode,
      guide: loadSkillGuide(join(REPO, "packages/motion-skill")),
    });
    return Response.json({ storyboard, verified: true, demo: false });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
