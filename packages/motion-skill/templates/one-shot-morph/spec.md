# one-shot-morph · Toma única que se transforma

Un solo elemento (una píldora, una tarjeta) se transforma en cada estado de la interfaz; nunca hay corte ni fundido; el cursor dispara cada transformación.

**Tendencia.** Plantilla de @twoclipping (Develop, 18k vistas) y el video de Claude donde una forma blanca se vuelve teléfono (7.5M). Muy copiada en la semana de Opus 5.5.

**Uso en FinalStudio.** Procedimientos de software y 'antes/después' de un concepto (una fracción que se vuelve decimal, porcentaje, gráfica).

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–2 s | píldora negra sobre fondo roto |
| 2–20 s | 8–12 estados de UI, cada uno nace del anterior |
| 20–29 s | cierre sobre el último estado |

Tempo: medio-rápido · cambios en rejilla de 120 BPM.

## Campos del spec

- `kicker`, `folio`, `step` (2.9 s por estado), `palette` (`bg`, `ink`, `accent`, `paper`).
- `fraction`: `num`, `den` (fracción propia). Decimal y porcentaje se calculan en el build.
- `text`: `start`, `startHint`, `pieLabel`, `pie`, `barLabel`, `pctLabel`, `end`; admiten `{num}`, `{den}`, `{dec}`, `{pct}`.
- Una sola capa cambia de caja con `clip-path: inset(... round r)`; el cursor dispara cada cambio. No hay cortes ni fundidos entre estados.

Ejemplo: `example.json`. Preview: `../../previews/one-shot-morph.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Tek kesintisiz çekim kur: her sahne bir önceki şeklin dönüşümüyle doğsun, geçişte fade kullanma ve imleç her tıklamada kamerayı 1,3 kat yakınlaştırsın. → Una sola toma continua: cada escena nace de la transformación de la anterior, sin fundidos; cada clic acerca la cámara 1.3×.

La plantilla de @twoclipping primero pide '8 a 12 estados de UI en los que se convierte la forma' (el prompt entrevista antes de construir).

## Referencias

- [@twoclipping · Develop](https://x.com/twoclipping/status/2103835273813496100)
- [@claudeai · forma blanca → teléfono (7.5M)](https://x.com/claudeai/status/2036850783526719610)

Bloques equivalentes del registro de HyperFrames: `morph-swap`, `card-resize`, `modal-morph`, `menu-morph`, `facet-morph`, `shared-axis-z`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; Inter y Plex Mono (OFL). Cursor e interfaz genéricos.
