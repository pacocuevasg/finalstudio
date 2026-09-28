# sand-ink · Animación de arena, tinta o pintura

Fondo sepia iluminado desde abajo, figuras que se forman y se borran con granos; transiciones por barrido de mano.

**Tendencia.** 31 de 893 videos Opus 5.5 son arena, tinta o pintura; @Michaelzsguo hizo 250 años de historia de EE. UU. en arena sepia con un prompt de una línea.

**Uso en FinalStudio.** Historia y literatura: líneas de tiempo narradas.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| por época | la arena dibuja, la mano barre, la siguiente escena nace del barrido |

Tempo: tranquilo.

## Campos del spec

- `grains` (1600), `seed`.
- `scenes[]`: `figure` = `pyramids` | `arch` | `book` | `wave`, `when`, `title`, `line`, `hold` (1.6 s).
- Los granos se sortean dentro de cada figura en el build; la mano barre de izquierda a derecha y la siguiente figura nace de la misma arena.
- Para una figura nueva basta con añadir una prueba de "está dentro" en `FIG`.

Ejemplo: `example.json`. Preview: `../../previews/sand-ink.mp4`.

## Receta original

prompt verbatim · @Michaelzsguo · [fuente](https://x.com/Michaelzsguo/status/2102592355165782312)

> Make a 2-minute sand animation that tells the story of 250 years of U.S. history. Keep it lively, engaging, and tasteful. Add appropriate background music and sound design.

Ideal para historia; hornear partículas con semilla para que sea determinista.

## Referencias

- [@Michaelzsguo · historia de EE. UU. en arena](https://x.com/Michaelzsguo/status/2102592355165782312)

Bloques equivalentes del registro de HyperFrames: `particle-image-reveal`, `ink-bleed-reveal`, `grain-overlay`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Texto citado con atribución.
- Esta plantilla: Plantilla original; figuras generadas con geometría propia, Instrument Serif y Plex Mono (OFL).
