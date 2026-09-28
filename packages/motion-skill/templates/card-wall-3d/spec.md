# card-wall-3d · Muro de tarjetas en 3D

Fondo negro, cientos de tarjetas verticales en rejilla 3D; la cámara vuela por el pasillo y aterriza en una.

**Tendencia.** Grok Imagine 1.0 (14.5M) y los lanzamientos de Pokémon TCG usan un muro de tarjetas en profundidad con la cámara avanzando entre ellas.

**Uso en FinalStudio.** Repaso de un tema con muchas tarjetas (flashcards de vocabulario).

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–3 s | la rejilla aparece |
| 3–20 s | la cámara avanza entre tarjetas |
| 20–25 s | aterriza en una tarjeta + título |

Tempo: medio.

## Campos del spec

- `kicker`, `deckName`, `answerLabel`, `caption` (`{n}` = número de tarjetas), `depth` (14 columnas), `fly` (7 s), `seed`.
- `cards[]`: `front`. `target`: `front` (debe estar en `cards`), `back` (la respuesta).
- Pasillo de dos paredes en CSS 3D; la cámara avanza, aterriza en la tarjeta objetivo y ésta gira.

Ejemplo: `example.json`. Preview: `../../previews/card-wall-3d.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Siyah zeminde dikey video kartlarını derinlikli 3D ızgaraya diz; kamerayı 3 saniyede kartların arasından ileri sür. → Coloca tarjetas verticales en una rejilla 3D con profundidad y avanza la cámara entre ellas en 3 s.

## Referencias

- [@SpaceXAI · Grok Imagine 1.0 (14.5M)](https://x.com/SpaceXAI/status/2018164753810764061)

Bloques equivalentes del registro de HyperFrames: `gallery-tunnel`, `cuboid-carousel`, `camera-rig-depth-stack`, `carousel-vision-1`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; tarjetas genéricas en CSS 3D, Inter, Instrument Serif y Plex Mono (OFL).
