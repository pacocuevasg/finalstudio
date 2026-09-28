# kinetic-showreel · Showreel de motion designer

Cortes secos cada ~1 s que alternan fondo claro y oscuro; palabras gigantes condensadas; una curva de easing que se dibuja en vivo; pelota que rebota con papel cebolla y nota a mano; retícula de puntos; cierre con logotipo.

**Tendencia.** El formato más viral de la semana de Opus 5.5: el showreel de @himanshutwtxs suma 236k vistas, el más visto de los 46 videos Opus 5.5 que etiquetó Montaj.

**Uso en FinalStudio.** Ganchos, intros y cierres de cualquier lección (6–12 s).

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–1 s | palabra gigante (gancho) |
| 1–2 s | segunda palabra con acento de color |
| 2–4 s | pelota que rebota + nota a mano |
| 4–6 s | curva de easing dibujándose |
| 6–7 s | contador grande |
| 7–8 s | retícula de puntos en ola |
| 8–10 s | título + subtítulo serif |

Tempo: rápido · 120 BPM, corte cada 2 tiempos.

## Campos del spec

- `bpm` (120): cada toma dura `beats` tiempos (2 por defecto).
- `palette`: `a` (claro), `b` (oscuro), `accent`.
- `shots[]`: `type` = `slam` | `ball` | `curve` | `count` | `grid` | `lockup`; `bg` = `a` | `b` | `accent` | color; `tag` (etiqueta de esquina).
  - `slam`: `words[]`, `accent` (índice de la palabra en color). El tamaño se ajusta solo al ancho.
  - `ball`: `note` manuscrita. `curve`: `label`, `note`. `count`: `value`, `suffix`. `lockup`: `title`, `sub`.

Ejemplo: `example.json`. Preview: `../../previews/kinetic-showreel.mp4`.

## Receta original

prompt verbatim · @ajith_io · [fuente](https://x.com/ajith_io/status/2103449416325890146)

> make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.

Nota de Montaj sobre el de @himanshutwtxs: añadir nota manuscrita a la pelota, dibujar la curva de easing en vivo y cortar cada 1 s entre fondo claro y oscuro.

## Referencias

- [@himanshutwtxs · Opus 5.5 showreel (236k vistas)](https://x.com/himanshutwtxs/status/2103495232637882858)
- [@aichrislee · showreel rojo y amarillo](https://x.com/aichrislee/status/2103878567540961335)
- [@kopert0x · showreel HUD verde](https://x.com/kopert0x/status/2103872213812158914)

Bloques equivalentes del registro de HyperFrames: `headline-slam`, `char-slam-explode`, `kinetic-center-build`, `beat-freeze-cut`, `count-up`, `dynamic-grid`, `beat-pulse-background`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Texto de @ajith_io citado con atribución como referencia.
- Esta plantilla: Plantilla original de FinalStudio; fuentes OFL (Anton, Instrument Serif, Caveat, Plex Mono).
