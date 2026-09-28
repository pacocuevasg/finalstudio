# talking-head-lineart · Video de cámara → B-roll de línea

La persona queda en un círculo abajo a la derecha; el cuadro principal dibuja en línea cada concepto justo cuando se menciona; audio, subtítulos y duración originales.

**Tendencia.** @AxtonLiu convirtió un video vertical de 83 s en un explicador de ~30 tomas de line art en 29 minutos, sin intervención.

**Uso en FinalStudio.** Profesores que suben su propia clase grabada y quieren dibujos que la acompañen.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| continuo | una toma de line art por frase, sincronizada con los subtítulos (Whisper) |

Tempo: lo marca la voz.

## Campos del spec

- `kicker`, `palette` (`paper`, `ink`, `accent`).
- `lines[]`: `say` (la frase), `dur` opcional, `art[]` (`kind` = `sun` | `sea` | `steam` | `cloud` | `rain` | `river`, `x`, `y`, `s`, `accent`), `labels[]` (`text`, `x`, `y`).
- Cada trazo se dibuja mientras se dice la frase; los subtítulos se encienden palabra por palabra.
- En producción: el círculo lleva la grabación del profesor y los tiempos por palabra vienen de la transcripción (Whisper). El preview usa un presentador dibujado y tiempos repartidos.

Ejemplo: `example.json`. Preview: `../../previews/talking-head-lineart.mp4`.

## Receta original

prompt verbatim (traducido del chino) · @AxtonLiu · [fuente](https://x.com/AxtonLiu/status/2102827887732932956)

> Convierte short-1.mp4 en un corto vertical nuevo: 1) mi imagen se reduce a un picture-in-picture circular abajo a la derecha, que se vea que hablo y no tape los subtítulos; 2) el cuadro principal pasa a una animación B-roll que sigue lo que digo: cuando menciono un concepto, se dibuja ese concepto; estilo relajado y divertido, line art está bien, nada realista; 3) audio, subtítulos y duración originales sin cambios.

Requiere transcripción con tiempos por palabra (el timing.json que ya propuso la investigación de comunidad).

## Referencias

- [@AxtonLiu · talking head → line art](https://x.com/AxtonLiu/status/2102827887732932956)

Bloques equivalentes del registro de HyperFrames: `hw-boil`, `svg-stroke-trace`, `caption-highlight`, `yt-circle-pointer`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Traducción propia del prompt, con atribución.
- Esta plantilla: Plantilla original; los dibujos de línea son propios. El presentador del preview es un dibujo genérico; en producción va la grabación del propio profesor.
