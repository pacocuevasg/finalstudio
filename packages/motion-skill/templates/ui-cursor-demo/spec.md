# ui-cursor-demo · Interfaz + cursor gigante + acercamiento

Ventana de app limpia sobre fondo neutro; un cursor sobredimensionado viaja, hace clic con onda y la cámara se acerca 1.2–1.3× al punto del clic; subtítulo en píldora abajo.

**Tendencia.** Es la gramática dominante: 159 de las 260 referencias de Montaj son animación de interfaz, 55 usan acercamiento y 46 cursor. Ejemplos: Claude Code Security (26M), Grok App Builder (24M).

**Uso en FinalStudio.** Tutoriales de software: Excel/Sheets, apps escolares, trámites en línea.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–1.5 s | cursor entra y hace clic |
| 1.5–3 s | acercamiento al elemento |
| 3–5 s | acción (escribir, elegir) |
| 5–6 s | resultado aparece |
| 6–10 s | se aleja y muestra el efecto completo |

Tempo: medio · movimientos de cámara de 0.9–1.1 s con power3.inOut.

## Campos del spec

- `appTitle`, `columns[]` (la última es la columna de la fórmula), `rows[][]`, `moneyCols[]`, `widths[]`.
- `formula` con `{r}` como número de fila (`=B{r}*C{r}`); se evalúa para cada fila.
- `expect[]` opcional: resultados esperados; si alguno no coincide, el build falla.
- `captions[3]`: clic, escribir, arrastrar.
- La interfaz es genérica a propósito; no imitar Excel, Sheets ni ninguna marca.

Ejemplo: `example.json`. Preview: `../../previews/ui-cursor-demo.mp4`.

## Receta original

prompt verbatim (fragmento) · @jake11moran (NotchBrowser, HyperFrames) · [fuente](https://x.com/jake11moran/status/2103239225902874874)

> Motion should feel slow and polished - one continuous camera over one Mac desktop, no hard cuts. Camera pushes, pulls and pans run like 1.5 to 3 seconds on gentle ease-in-out curves, nothing snappy - aim for half the speed you'd default to. Add motion blur on fast moves and a light film grain finish. Use an oversized macOS cursor.

Montaj: cuando el cursor toca el botón, acercar 1.3×; en clic, el botón baja a 0.95× y regresa. Regla de make-awesome-video: nunca inventar UI; usar capturas reales o componentes reales.

## Referencias

- [@claudeai · Claude Code Security (26M)](https://x.com/claudeai/status/2024907535145468326)
- [@claudeai · Claude Cowork (49.8M)](https://x.com/claudeai/status/2010805682434666759)
- [@stephenhaney · Paper](https://x.com/stephenhaney/status/2081810796812869878)

Bloques equivalentes del registro de HyperFrames: `oversized-cursor`, `simulated-cursor`, `ui-focus-zoom`, `press-ripple`, `gesture-tap`, `browser-device-stage`, `push-in`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Fragmento citado con atribución.
- Esta plantilla: Plantilla original con hoja de cálculo genérica; nunca imitar la interfaz de un producto real.
