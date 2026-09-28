"use client";

// Pantalla C · Storyboard: seconds, not a render. Every scene can be edited
// as text before spending on the video.

import { verifyStoryboard, type Storyboard } from "@finalstudio/core";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { loadDraft, saveDraft, type Draft } from "@/lib/draft";
import { Frame } from "@/lib/frame";

const clean = (say: string) => say.replace(/\{\{[\w-]+\}\}/g, "").replace(/\|\|/g, "·").replace(/\s+/g, " ").trim();

function BoardText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((p, i) =>
        p.startsWith("[") ? <mark key={i}>{p.slice(1, -1)}</mark> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

export default function StoryboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(loadDraft()), []);
  const sb = draft?.storyboard;
  const check = useMemo(() => (sb ? verifyStoryboard(sb) : null), [sb]);

  if (!draft || !sb)
    return (
      <Frame chapter="03 — storyboard" step="guion">
        <p className="muted">No hay storyboard todavía. Empieza desde tu materia.</p>
      </Frame>
    );

  const update = (next: Storyboard) => {
    const d = { ...draft, storyboard: next };
    setDraft(d);
    saveDraft(d);
  };

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storyboard: sb }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? res.statusText);
      router.push(`/video/${body.id}?captions=${draft!.settings.captions ? 1 : 0}`);
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setBusy(false);
    }
  }

  return (
    <Frame chapter="03 — storyboard" step={`${sb.scenes.length} escenas`}>
      <p className="label">
        {check?.ok ? <span className="badge">✓ solución verificada</span> : <span className="badge fail">✗ no cuadra: {check && !check.ok && check.line}</span>}
        {draft.demo && <span className="muted"> · ejemplo (falta ANTHROPIC_API_KEY)</span>}
      </p>
      <h1>{sb.title}</h1>
      <div className="scenes" style={{ marginTop: 24 }}>
        {sb.scenes.map((s, i) => (
          <article className="scene" key={i}>
            <span className="muted">// {s.label}</span>
            {editing === i ? (
              <textarea
                rows={4}
                defaultValue={s.say}
                autoFocus
                onBlur={(e) => {
                  const scenes = sb.scenes.map((x, k) => (k === i ? { ...x, say: e.target.value, show: undefined } : x));
                  update({ ...sb, scenes });
                  setEditing(null);
                }}
              />
            ) : (
              <button className="say" onClick={() => setEditing(i)} title="Cambiar lo que dice">
                {clean(s.say)}
              </button>
            )}
            {s.board.map((b, k) => (
              <div className="board" key={k}>
                <BoardText text={b.text} />
              </div>
            ))}
          </article>
        ))}
      </div>
      <div className="row">
        <button className="btn" disabled={busy || !check?.ok} onClick={generate}>
          {busy ? "enviando…" : "Generar video"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </Frame>
  );
}
