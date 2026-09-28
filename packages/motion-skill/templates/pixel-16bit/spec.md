# pixel-16bit · Pixel art de 16 bits en loop

Lienzo lógico chico (128×96 o 160×90) escalado sin suavizado, paleta fija de ~24 colores, máquina de estados IDLE → CHARGE → CAST → RECOVER, partículas en rejilla.

**Tendencia.** 52 de 893 videos Opus 5.5 clasificados son pixel art. Los prompts de @majidmanzarpour (mago) y @riku720720 (runner arcoíris) son los más copiados por lo técnicos que son.

**Uso en FinalStudio.** Lecciones gamificadas para primaria; mascota de la plataforma.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| loop | estado por estado, 8–12 fps de pose aunque renderice a 60 |

Tempo: loop sin costura.

## Campos del spec

- `sum`: `a`, `b` (máximo 10 monedas). El total se calcula en el build.
- `seed`: estrellas del fondo.
- Lienzo lógico de 160×90 escalado ×12 con `crispEdges`; sprites definidos como mapas de caracteres y una paleta fija.
- Estados IDLE → CHARGE → CAST → RECOVER; todo movimiento usa `steps()` para poses a ~10 fps.

Ejemplo: `example.json`. Preview: `../../previews/pixel-16bit.mp4`.

## Receta original

prompt verbatim (inicio) · @majidmanzarpour · [fuente](https://x.com/majidmanzarpour/status/2102476258948927543)

> Create a single self-contained HTML file that renders an animated pixel art wizard casting a spell, using vanilla JavaScript and Canvas 2D. No external assets, libraries, or network requests. RENDERING - Draw everything to an offscreen canvas at a fixed logical resolution of 128x96, then blit to a fullscreen display canvas scaled by the largest integer factor that fits the window … Fixed palette of ~24 hex colors …

Para HyperFrames: cambiar el loop con requestAnimationFrame por estado calculado desde t (determinismo) y hornear sprites en PNG.

## Referencias

- [@majidmanzarpour · mago pixel](https://x.com/majidmanzarpour/status/2102476258948927543)
- [@riku720720 · runner arcoíris](https://x.com/riku720720/status/2102515055116063144)

Bloques equivalentes del registro de HyperFrames: `stop-motion-cadence`, `ascii-render-pass`, `grid-pixelate-wipe`, `ordered-dither-pass`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Fragmento citado con atribución.
- Esta plantilla: Plantilla original; sprites y paleta dibujados a mano en el código, Press Start 2P (OFL).
