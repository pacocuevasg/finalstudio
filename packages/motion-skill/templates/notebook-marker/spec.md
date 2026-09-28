# notebook-marker · Cuaderno a mano con marcador

Hoja cuadriculada con margen rojo, letra manuscrita que escribe un lápiz, resaltador amarillo, círculo rojo alrededor del resultado y flecha a una nota.

**Tendencia.** 38 de 893 videos Opus 5.5 clasificados son dibujados a mano; HyperFrames sacó una familia entera de bloques hw-* y vox-annotate porque su estudio de X lo pidió. Ejemplos: Mebbian (@ik_builds), Claude Code Security abre con una laptop dibujada.

**Uso en FinalStudio.** Ejercicios resueltos paso a paso: regla de tres, fracciones, ecuaciones, física básica.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–1 s | título escrito a mano |
| 1–9 s | una línea por paso; notas mono al margen |
| 9–12 s | resultado encerrado + flecha a la llamada |

Tempo: tranquilo · 50 ms por carácter, pausa 0.9 s entre líneas.

## Campos del spec

- `duration`, `title`, `lineHeight` (144), `top` (300), `palette`.
- `vars`: valores de las incógnitas para verificar (`{"x": 105}`).
- `lines[]`: `text`, `note` (comentario mono al margen), `at` opcional, `pause` (0.9 s).
  - `{texto}` → resaltador amarillo; `[texto]` → círculo rojo; `[texto|llamada]` → círculo + flecha a la llamada.
- Cada línea con `=` y dos lados numéricos (tras sustituir `vars`) se evalúa; si no cuadra, el build falla.

Ejemplo: `example.json`. Preview: `../../previews/notebook-marker.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Kağıt beyazı zeminde notları el yazısıyla çizerek yaz, topa onion skin izi ver ve her 1,5 saniyede açık ile koyu zemin arasında sert geçiş yap. → Escribe las notas a mano sobre papel blanco, papel cebolla a la pelota y corte seco claro/oscuro cada 1.5 s (Mebbian).

La plantilla verifica la aritmética de cada línea antes de animar (si 45 × 7 ÷ 3 no da 105, el build falla).

## Referencias

- [@ik_builds · Mebbian](https://x.com/ik_builds/status/2103890476885585923)
- [@claudeai · Claude Code Security (laptop dibujada)](https://x.com/claudeai/status/2024907535145468326)
- [HyperFrames · bloques hw-* y vox-annotate](https://github.com/heygen-com/hyperframes/tree/main/registry)

Bloques equivalentes del registro de HyperFrames: `hw-write-title`, `hw-underline`, `hw-callout-circle`, `hw-arrow`, `hw-box-label`, `vox-annotate`, `marker-highlight`, `whiteboard-ink`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; Caveat y Plex Mono (OFL).
