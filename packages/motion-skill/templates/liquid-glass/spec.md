# liquid-glass · Cristal líquido pastel

Degradado lavanda-azul, botones y tarjetas de vidrio esmerilado que crecen con resorte y derivan su forma de la anterior.

**Tendencia.** Fluid de @motion_conquest (85k vistas, segundo más visto de Opus 5.5 en Montaj); HyperFrames tiene cuatro bloques de liquid glass.

**Uso en FinalStudio.** Tarjetas de resumen y 'lo que aprendiste hoy'.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–16 s | una tarjeta de vidrio que se transforma: botón → píldora → tarjeta de actividad → pila de notificaciones |

Tempo: medio · resortes de 0.4 s.

## Campos del spec

- `kicker`, `button`, `unit`, `cardLabel`, `streak`, `hold` (2.4 s por estado).
- `topics[]` (mínimo 3): `name`, `note`, `icon`, `done`. El anillo y el "x de y" se calculan de `done`.
- La forma de vidrio pasa de botón a píldora, a tarjeta de actividad y a pila de notificaciones con resortes (`elastic.out`).

Ejemplo: `example.json`. Preview: `../../previews/liquid-glass.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Pastel mor mavi gradyan üstünde buzlu cam kartları yaylı hareketle 0,4 saniyede büyüt ve her öğeyi bir öncekinden şekil değiştirerek türet. → Sobre degradado pastel, haz crecer tarjetas de vidrio con resorte en 0.4 s y deriva cada elemento del anterior.

## Referencias

- [@motion_conquest · Fluid](https://x.com/motion_conquest/status/2103510103622308152)

Bloques equivalentes del registro de HyperFrames: `ios26-liquid-glass`, `liquid-glass-widgets`, `vfx-liquid-glass`, `macos-tahoe-liquid-glass`, `spring-pop`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; no reproduce íconos ni componentes de Apple. Inter y Plex Mono (OFL).
