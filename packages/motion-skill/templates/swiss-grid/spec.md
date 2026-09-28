# swiss-grid · Póster suizo técnico

Gris claro con retícula técnica, tipografía geométrica gruesa estilo póster suizo, líneas naranja, transiciones que se rompen en bloques grises de píxel en 0.3 s.

**Tendencia.** AI Grand Prix de Anduril (7.7M, 5 estrellas en Montaj): retícula técnica gris, líneas naranja finas y disolución en bloques de píxel.

**Uso en FinalStudio.** Portadas de unidad y temarios.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–10.6 s | 4–5 carteles, corte por disolución en píxeles |

Tempo: rápido.

## Campos del spec

- `foot`, `hold` (2.4 s por cartel), `seed` (orden de los bloques del corte), `palette`.
- `posters[]`: `word`, `meta` (`\n` = salto), `note`, `shape` = `line` | `circle` | `stairs` | `graph`.
- `graph`: `m`, `b`, `x0`, `x1`; la recta se traza con esos números.
- Corte: la pantalla se rompe en bloques grises de 120 px durante 0.3 s.

Ejemplo: `example.json`. Preview: `../../previews/swiss-grid.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Açık gri zeminde ince turuncu teknik çizgiler ve kalın geometrik başlık kullan; sahneleri 0,3 saniyede gri piksel bloklarına ayrıştırarak geç. → Líneas técnicas naranja finas sobre gris claro, titular geométrico grueso; transición en bloques de píxel de 0.3 s.

## Referencias

- [@anduriltech · AI Grand Prix (7.7M)](https://x.com/anduriltech/status/2016233946607141290)

Bloques equivalentes del registro de HyperFrames: `swiss-grid`, `vignelli`, `grid-pixelate-wipe`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; retícula y formas propias, Inter y Plex Mono (OFL).
