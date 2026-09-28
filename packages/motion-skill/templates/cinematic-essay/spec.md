# cinematic-essay · Ensayo cinematográfico con motivo

Fondo profundo oscuro, un solo acento cálido que evoluciona, máximo ~8 palabras en pantalla, transiciones que nacen del contenido (la red se transforma, la cámara entra por un nodo).

**Tendencia.** El film de @kimmonismus sobre la historia de la IA (3 min, Remotion) trae uno de los prompts más completos publicados: un protagonista visual (un token brillante) que recorre todas las eras.

**Uso en FinalStudio.** Temas largos (3–6 min): historia de la ciencia, un capítulo completo.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–15 s | apertura en frío |
| 15–150 s | una escena por etapa, alternando denso y calmado |
| 150–180 s | todo converge; vuelve el motivo; título |

Tempo: variable · cada texto ≥ 2.5 s en pantalla.

## Campos del spec

- `open`, `close`, `title`; cada texto en pantalla debe tener 8 palabras o menos (el build falla si no).
- `stages[]`: `name`, `when`, `motif` = `sphere` | `pudding` | `nucleus` | `shells`, `line`, `hold` (mín. 2.5 s).
- `accents[]`: el acento cálido cambia de etapa en etapa.
- La cámara entra al nodo de la constelación, la etapa vive dentro y la cámara sale para encender el siguiente nodo.

Ejemplo: `example.json`. Preview: `../../previews/cinematic-essay.mp4`.

## Receta original

prompt verbatim (fragmento) · @kimmonismus · [fuente](https://x.com/kimmonismus/status/2102847451111772219)

> It should feel like a cinematic essay, not a slideshow or a timeline infographic. … Before building, write STORYBOARD.md with each scene's timing, visuals, on-screen text and transitions. … After each scene, render 3–4 stills and look at them critically. … Accuracy matters: use correct years, names and paper titles. If you're unsure about a specific fact, leave it out rather than guess, and list any uncertain claims in NOTES.md. Typography: max ~8 words on screen at once, and leave every text visible long enough to read (≥ 2.5 s).

Sus reglas de oficio coinciden con las nuestras: storyboard primero, stills por escena, hechos verificados y lista de dudas.

## Referencias

- [@kimmonismus · Attention Is All You Need → AGI](https://x.com/kimmonismus/status/2102844654169575547)

Bloques equivalentes del registro de HyperFrames: `scroll-camera-story`, `zoom-through-transition`, `constellation-hub`, `tracing-beam`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Fragmentos citados con atribución.
- Esta plantilla: Plantilla original; motivos dibujados en SVG, Instrument Serif, Inter y Plex Mono (OFL).
