# retro-window · Ventanas retro con trama rosa

Fondo blanco roto con manchas de semitono rosa, ventanas retro con marco negro, datos en mono, contador de costo grande.

**Tendencia.** Jev de @polydao (autor del prompt de showreel con duración variable): paneles tipo sistema operativo viejo, fuente mono y manchas de trama.

**Uso en FinalStudio.** Variante de datos con la estética halftone de FinalStudio.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–24 s | una ventana por dato; el número final rueda en 0.8 s |

Tempo: rápido.

## Campos del spec

- `title`, `inputs` (`wh`, `perDay`, `days`, `price`), `palette`.
- `windows[]`: `bar`, `label`, `value` (admite `{wh}`, `{charges}`, `{kwh}`, `{price}`, `{cost}`), `unit`, `x`, `y`, `w`.
- `big`: la ventana final con el contador (`bar`, `label`, `unit`, `x`, `y`, `w`).
- Energía y costo se calculan en el build; ningún número derivado se escribe a mano.

Ejemplo: `example.json`. Preview: `../../previews/retro-window.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Kırık beyaz zemine pembe raster lekeler koy, verileri siyah çerçeveli retro pencerelerde mono fontla göster ve maliyet rakamını 0,8 saniyede say. → Manchas de trama rosa sobre blanco roto, datos en ventanas retro con marco negro y fuente mono; el costo cuenta en 0.8 s.

## Referencias

- [@polydao · Jev](https://x.com/polydao/status/2103783134206566862)

Bloques equivalentes del registro de HyperFrames: `halftone-field`, `halftone-dissolve`, `number-pop-in`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; ventanas genéricas en CSS, Press Start 2P, Inter y Plex Mono (OFL).
