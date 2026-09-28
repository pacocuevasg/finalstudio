import { Storyboard, verifyStoryboard } from "@finalstudio/core";

import { startJob } from "@/lib/jobs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { storyboard } = (await req.json()) as { storyboard?: unknown };
  const parsed = Storyboard.safeParse(storyboard);
  if (!parsed.success) return Response.json({ error: parsed.error.message }, { status: 400 });
  const check = verifyStoryboard(parsed.data);
  if (!check.ok) return Response.json({ error: `la línea "${check.line}" no cuadra` }, { status: 422 });
  const job = startJob(parsed.data);
  return Response.json({ id: job.id });
}
