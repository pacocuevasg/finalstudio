"use client";

// Pantalla A · Materia: drop anything, say what you want explained.

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";

import { DEFAULT_SETTINGS, saveDraft } from "@/lib/draft";
import { Frame } from "@/lib/frame";

type Picked = { name: string; size: number };

export default function SubjectPage() {
  const router = useRouter();
  const [files, setFiles] = useState<Picked[]>([]);
  const [over, setOver] = useState(false);
  const [ask, setAsk] = useState("");

  const add = (list: FileList | null) =>
    list && setFiles((f) => [...f, ...Array.from(list, (x) => ({ name: x.name, size: x.size }))]);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    add(e.dataTransfer.files);
  };
  const go = () => {
    saveDraft({ exercise: ask.trim(), settings: DEFAULT_SETTINGS });
    router.push("/ejercicio");
  };

  return (
    <Frame chapter="01 — materia" step="apuntes">
      <p className="label">// tu cuaderno</p>
      <h1>Álgebra · prepa</h1>
      <p className="muted">Sube lo que tengas y dime qué quieres entender.</p>

      <label
        className={`drop ${over ? "over" : ""}`}
        style={{ display: "block", marginTop: 32 }}
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input type="file" multiple hidden onChange={(e) => add(e.target.files)} accept=".pdf,.png,.jpg,.jpeg,.heic,.docx,.xlsx,.pptx,.txt" />
        arrastra apuntes, fotos, PDFs, Excel o tu temario
        <div className="muted" style={{ marginTop: 8 }}>o toca para tomar una foto desde el celular</div>
      </label>
      {files.length > 0 && (
        <ul className="files">
          {files.map((f, i) => (
            <li key={i}>
              <span>{f.name}</span>
              <span className="muted">por leer</span>
            </li>
          ))}
        </ul>
      )}

      <h2>// ¿qué te explico?</h2>
      <div className="bubble">
        <textarea
          rows={2}
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder="resuelve 2x + 3 = 11 paso a paso"
        />
        <button className="btn" disabled={!ask.trim()} onClick={go}>
          Preparar video
        </button>
      </div>
    </Frame>
  );
}
