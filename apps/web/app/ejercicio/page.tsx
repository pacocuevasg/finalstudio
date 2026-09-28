"use client";

// Pantalla B · Ajustes rápidos: everything is inferred; the student only
// changes what they want. Then Claude writes and verifies the storyboard.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DEFAULT_SETTINGS, loadDraft, saveDraft, type Settings } from "@/lib/draft";
import { Frame } from "@/lib/frame";

const OPTIONS: { key: keyof Settings; label: string; values: (string | boolean)[] }[] = [
  { key: "level", label: "nivel", values: ["secundaria", "prepa", "universidad"] },
  { key: "language", label: "idioma", values: ["es-MX", "es-ES"] },
  { key: "mode", label: "modo", values: ["paso a paso", "solo la idea clave", "hazme uno parecido", "error común"] },
  { key: "captions", label: "subtítulos", values: [true, false] },
];

const show = (v: string | boolean) => (v === true ? "sí" : v === false ? "no" : v);

export default function ExercisePage() {
  const router = useRouter();
  const [exercise, setExercise] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setExercise(d.exercise);
      setSettings(d.settings);
    }
  }, []);

  async function prepare() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exercise, settings }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? res.statusText);
      saveDraft({ exercise, settings, storyboard: body.storyboard, demo: body.demo });
      router.push("/storyboard");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Frame chapter="02 — ajustes" step="ejercicio">
      <p className="label">// detectado: resolver paso a paso</p>
      <div className="bubble" style={{ marginBottom: 32 }}>
        <textarea rows={2} value={exercise} onChange={(e) => setExercise(e.target.value)} />
      </div>
      <div className="settings">
        {OPTIONS.map((o) => (
          <div key={o.key} style={{ display: "contents" }}>
            <span className="muted">{o.label}</span>
            <div className="chips">
              {o.values.map((v) => (
                <button
                  key={String(v)}
                  className="chip"
                  aria-pressed={settings[o.key] === v}
                  onClick={() => setSettings({ ...settings, [o.key]: v })}
                >
                  {show(v)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        <button className="btn" disabled={busy || !exercise.trim()} onClick={prepare}>
          {busy ? "resolviendo y comprobando…" : "Ver storyboard"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </Frame>
  );
}
