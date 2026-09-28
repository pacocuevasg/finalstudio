import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const job = getJob((await params).id);
  if (!job) return Response.json({ error: "no existe" }, { status: 404 });
  const { dir: _dir, mp4: _mp4, ...pub } = job;
  return Response.json(pub);
}
