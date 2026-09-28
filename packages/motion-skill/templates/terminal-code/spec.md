# terminal-code · Terminal inclinada que se endereza

Terminal clara en perspectiva que gira a plano, comandos tecleados carácter por carácter, salida real impresa de golpe, un subtítulo simple por comando.

**Tendencia.** Remotion Agent Skills (18.8M vistas) popularizó la terminal blanca inclinada; en Opus 5.5 lo repiten Opus Video Studio y varios showreels de portafolio.

**Uso en FinalStudio.** Programación: git, Python, comandos de consola.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–1.4 s | toma inclinada → plano |
| cada ~3 s | comando tecleado + salida + explicación |

Tempo: medio · 55 ms por tecla.

## Campos del spec

- `title`, `windowTitle`, `cwd`, `keyTime` (0.055 s por tecla), `palette`.
- `steps[]`: `cmd`, `out[]` (salida real del comando), `caption`, `hold` (1.6 s), `okLines[]` (líneas en verde).
- La salida debe copiarse de una ejecución real; la plantilla no la inventa.

Ejemplo: `example.json`. Preview: `../../previews/terminal-code.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Beyaz terminal penceresini 10 derece eğik göster, komutu harf harf 0,04 saniye arayla yaz ve çıktıda ASCII başlığı tek karede bas. → Terminal blanca inclinada 10°, comando letra por letra cada 0.04 s y la salida en un solo cuadro.

Aquí el tecleo sí se vale (en el resto está prohibido por las reglas de motion-graphics-skills). La salida debe ser la real del comando.

## Referencias

- [@Remotion · Agent Skills (18.8M)](https://x.com/Remotion/status/2013626968386765291)

Bloques equivalentes del registro de HyperFrames: `terminal-simulator`, `code-terminal-run`, `code-typing`, `code-diff`, `code-highlight`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; JetBrains Mono (OFL).
