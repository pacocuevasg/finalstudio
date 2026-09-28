# collage-vox · Collage de papel estilo Vox

Papel kraft, recortes, notas adhesivas, grabados antiguos, titulares serif con palabra clave en color, subrayado a mano.

**Tendencia.** 32 de 260 referencias son collage; Claude Fable 5 (57.5M) usa tarjetas de mapas y grabados; vox-director (MIT) hace 'style bake-off' de 3–4 estilos antes de renderizar.

**Uso en FinalStudio.** Historia, geografía, literatura.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| por idea | recorte entra, se anota, sale con barrido de papel |

Tempo: medio.

## Campos del spec

- `kicker`, `seed` (bordes rasgados).
- `ideas[]`: `title` (`*palabra*` en rojo), `text`, `engraving` = `river` | `flood` | `wheat`, `note` (nota adhesiva), `mark` (trazo de marcador en coordenadas de 1920×1080), `hold` (3.4 s).
- Cambio de idea con un barrido de papel kraft. Los grabados son dibujos SVG propios con tramado; no se usan imágenes de archivo.

Ejemplo: `example.json`. Preview: `../../previews/collage-vox.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Bej kağıt dokusu üstüne yapışkan notları ve ekranları hafif eğik yapıştır, serif başlıkta anahtar kelimeyi turuncu yap ve kartları yelpaze gibi aç. → Pega notas y pantallas ligeramente inclinadas sobre papel beige, palabra clave del titular serif en naranja, tarjetas en abanico.

## Referencias

- [@claudeai · Claude Fable 5 (57.5M)](https://x.com/claudeai/status/2064394146916229443)
- [@helloshiva0801 · redesignr.ai](https://x.com/helloshiva0801/status/2103733875734438284)
- [Alisa0808/vox-director (MIT)](https://github.com/Alisa0808/vox-director)

Bloques equivalentes del registro de HyperFrames: `vox-annotate`, `texture-mask-text`, `ink-bleed-reveal`, `split-tilt-cards`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets. Los grabados deben ser de dominio público o propios.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; recortes y grabados dibujados en SVG (sin imágenes de archivo), Instrument Serif, Caveat, Inter y Plex Mono (OFL).
