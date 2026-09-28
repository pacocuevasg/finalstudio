import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";

// ?kind=vtt returns the captions; otherwise the MP4 (with Range support so
// the player can seek to a chapter).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const job = getJob((await params).id);
  if (!job || job.status !== "done" || !job.mp4) return new Response("not ready", { status: 404 });
  if (new URL(req.url).searchParams.get("kind") === "vtt")
    return new Response(readFileSync(join(job.dir, "captions.vtt")), { headers: { "content-type": "text/vtt; charset=utf-8" } });

  const size = statSync(job.mp4).size;
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") ?? "");
  const data = readFileSync(job.mp4);
  if (!range) return new Response(data, { headers: { "content-type": "video/mp4", "content-length": String(size), "accept-ranges": "bytes" } });
  const start = range[1] ? +range[1] : 0;
  const end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
  return new Response(data.subarray(start, end + 1), {
    status: 206,
    headers: {
      "content-type": "video/mp4",
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": String(end - start + 1),
      "accept-ranges": "bytes",
    },
  });
}
