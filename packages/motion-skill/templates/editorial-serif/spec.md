# editorial-serif · Editorial crema con serif itálica

Papel crema con grano, frase en sans gruesa donde una palabra cambia a serif itálica en terracota, etiquetas mono pequeñas, tarjetas blancas unidas por líneas finas que se dibujan.

**Tendencia.** Es el lenguaje de los lanzamientos de Claude: el video de control de escritorio tiene 78M de vistas, Cowork 49.8M y Fable 5 57.5M. En Opus 5.5 lo imitan TypeSafe AI, LaunchRepo y el video de perfil de @superalesha (sans gruesa + serif itálica en color).

**Uso en FinalStudio.** Definiciones, conceptos y fórmulas (biología, historia, química).

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–3 s | pregunta titular, palabra por palabra |
| 3–8 s | término grande + tarjeta de definición unida por una línea |
| 8–12 s | fórmula o dato con subrayado a mano |
| 12–15 s | frase de cierre + marca |

Tempo: medio · cada palabra sube desde su máscara en 0.55 s, escalonada 70 ms.

## Campos del spec

- `duration`, `kicker`, `folio`, `brand`, `palette` (`paper`, `ink`, `accent`, `muted`, `rule`).
- `beats[]` con `at` (segundos) y `type`:
  - `headline`: `text`; `*palabra*` sale en serif itálica de acento.
  - `definition`: `term`, `label`, `text`.
  - `equation`: `label`, `text` (tokens separados por espacio; `CO_2` → subíndice, `x^2` → exponente), `note`.
  - `closing`: `text`.

Ejemplo: `example.json`. Preview: `../../previews/editorial-serif.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Krem zeminde serif başlıkla aç, telefon kartını pencereye ince bir okla bağla ve mesaj balonunu kiremit renginde 0,4 saniyede büyüt. → Abre con titular serif sobre crema, une la tarjeta con una flecha fina y haz crecer el globo terracota en 0.4 s.

Regla de @superalesha / TypeSafe: la segunda mitad de cada titular va en serif itálica.

## Referencias

- [@claudeai · Claude controla tu escritorio (78M)](https://x.com/claudeai/status/2036195789601374705)
- [@claudeai · Claude Cowork (49.8M)](https://x.com/claudeai/status/2010805682434666759)
- [@superalesha · video de perfil](https://x.com/superalesha/status/2103578446056321426)
- [@leo114119 · TypeSafe AI](https://x.com/leo114119/status/2103888036442550523)
- [@AleksDoesCode · LaunchRepo](https://x.com/AleksDoesCode/status/2103889609625100565)

Bloques equivalentes del registro de HyperFrames: `per-word-rise`, `caption-editorial-emphasis`, `inline-highlight`, `titlecard-calm`, `svg-stroke-trace`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets. No usamos marcas, logos ni la paleta exacta de Anthropic.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; Inter, Instrument Serif y Plex Mono (OFL).
