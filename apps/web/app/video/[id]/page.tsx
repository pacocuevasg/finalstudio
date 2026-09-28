"use client";

// Pantalla D · Reproductor: chapters, captions, and the next thing to study.

import type { Chapter } from "@finalstudio/core";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Frame } from "@/lib/frame";

type Status = { status: string; progress: number; duration?: number; chapters?: Chapter[]; voice?: string; error?: string };

const mmss = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const WORDS: Record<string, string> = {
  queued: "en fila",
  building: "generando la voz y armando escenas",
  rendering: "grabando el video",
  done: "listo",
  failed: "falló",
};

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const captions = useSearchParams().get("captions") !== "0";
  const [s, setS] = useState<Status | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      const res = await fetch(`/api/render/${id}`);
      const body = (await res.json()) as Status;
      if (stop) return;
      setS(body);
      if (body.status !== "done" && body.status !== "failed") setTimeout(tick, 1500);
    };
    void tick();
    return () => {
      stop = true;
    };
  }, [id]);

  return (
    <Frame chapter="04 — video" step={s?.duration ? mmss(s.duration) : "…"}>
      {!s && <p className="muted">cargando…</p>}
      {s && s.status !== "done" && (
        <>
          <p className="label">// {WORDS[s.status] ?? s.status}</p>
          <div className="progress">
            <div style={{ width: `${Math.round(s.progress * 100)}%` }} />
          </div>
          {s.error && <p className="error">{s.error}</p>}
        </>
      )}
      {s?.status === "done" && (
        <>
          <video ref={video} controls playsInline src={`/api/render/${id}/file`}>
            <track kind="captions" srcLang="es" label="Español" src={`/api/render/${id}/file?kind=vtt`} default={captions} />
          </video>
          <p className="label" style={{ marginTop: 8 }}>
            // mp4 · subtítulos · voz {s.voice}
          </p>
          <h2>// capítulos</h2>
          <ul className="chapters">
            {s.chapters?.map((c) => (
              <li key={c.label}>
                <button
                  onClick={() => {
                    if (!video.current) return;
                    video.current.currentTime = c.start;
                    void video.current.play();
                  }}
                >
                  <span>{c.label}</span>
                  <span className="muted">{mmss(c.start)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="row">
            <a className="btn" href={`/api/render/${id}/file`} download="finalstudio.mp4">
              Descargar
            </a>
            <Link className="btn ghost" href="/">
              Otro ejercicio
            </Link>
          </div>
        </>
      )}
    </Frame>
  );
}
