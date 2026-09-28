# felt-stopmotion · Stop motion de fieltro

Mesa de fieltro café, pared verde, figuras de tela que saltan a 12 fps; el logo usa la misma textura.

**Tendencia.** FowlNote (@argofowl) y la claymation de Blender de @alexalbert__: texturas de tela, 12 fps y personajes redondos.

**Uso en FinalStudio.** Primaria: conteo, fracciones con objetos.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–15 s | saltos de personajes; un tazón se llena de bolitas |

Tempo: tranquilo · 12 fps con holds.

## Campos del spec

- `friends[2]`: `name`, `color`, `balls`, `ballColor`. Máximo 8 bolitas en total; la suma se calcula en el build.
- Todo movimiento va en pasos de 12 fps, con pausas entre acciones y un leve temblor ("boil") en los personajes.
- Textura de fieltro con `feTurbulence` de semilla fija.

Ejemplo: `example.json`. Preview: `../../previews/felt-stopmotion.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Tüm yüzeylere keçe ve kumaş dokusu ver, yuvarlak karakterleri stop motion hissi için saniyede 12 kareyle zıplat ve logoyu da aynı dokuyla yaz. → Textura de fieltro en todo, personajes redondos a 12 fps y el logo con la misma textura.

## Referencias

- [@argofowl · FowlNote](https://x.com/argofowl/status/2103800311802658965)

Bloques equivalentes del registro de HyperFrames: `stop-motion-cadence`, `grain-overlay`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; personajes y textura de fieltro generados en CSS/SVG, Caveat (OFL).
