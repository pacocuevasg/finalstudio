# pour-layers · Receta: el vaso se llena por capas

Vaso vacío al centro; cada ingrediente cae en chorro y forma su capa; lista a la izquierda con palomitas; etiqueta con la medida junto a cada capa.

**Tendencia.** El Negroni de @Ror_Fly: explicador de 30 s generado desde una sola imagen, con cada ingrediente y su medida entrando al vaso.

**Uso en FinalStudio.** Química y ciencias (mezclas, densidad), recetas, proporciones.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–1 s | vaso vacío + título |
| ~2.5 s por ingrediente | chorro, capa, etiqueta, palomita |
| final | frase de conclusión |

Tempo: tranquilo.

## Campos del spec

- `kicker`, `title`, `unit`, `capacity`, `orderBy` (`density` activa la verificación), `doneText` (`*palabra*` en serif).
- `items[]`: `name`, `amount`, `color`, `note`, `density` (si `orderBy: density`).
- El build falla si una capa es más densa que la de abajo o si las capas no caben en el vaso.

Ejemplo: `example.json`. Preview: `../../previews/pour-layers.mp4`.

## Receta original

prompt verbatim · @Ror_Fly · [fuente](https://x.com/Ror_Fly/status/2102853258582880547)

> We're going to try a little test. Do you think you could render a recipe motion graphic animation using javascript or html (w/e you think will produce the best) to show the full recipe from start to finish (empty glass to completed cocktail) - Explainer video style - Showing the recipe ingreidents + measurements as they're going into the cup. Should be a 30s video.

Generalizado a mezclas y experimentos. Con orderBy: density el build verifica que cada capa sea menos densa que la de abajo.

## Referencias

- [@Ror_Fly · Negroni](https://x.com/Ror_Fly/status/2102853258582880547)

Bloques equivalentes del registro de HyperFrames: `stagger-cascade`, `marker-checklist-card`, `success-check`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Texto de @Ror_Fly citado con atribución.
- Esta plantilla: Plantilla original.
