# split-runner · Explicación + juego en pantalla dividida

Mitad lección (papel claro, fórmula paso a paso, figura), mitad juego de carrera infinita; subtítulos gruesos con contorno y palabra activa en amarillo.

**Tendencia.** El prompt de Riley Goodside (@goodside) se volvió referencia: una mitad explica Black-Scholes con voz, la otra muestra un 'runner' genérico. Es el formato 'brainrot' que ya consumen los estudiantes en TikTok.

**Uso en FinalStudio.** Repasos rápidos para redes: teoremas, fórmulas, vocabulario.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–2.5 s | pregunta + figura |
| 2.5–10 s | una línea de la fórmula cada 2.4 s |
| 10–14 s | respuesta en caja invertida |

Tempo: constante · el juego nunca se detiene; subtítulos karaoke 0.32 s por palabra.

## Campos del spec

- `layout`: `landscape` (1920×1080, juego a la izquierda) o `vertical` (1080×1920, juego abajo).
- `duration`, `seed` (horario de obstáculos), `kicker`, `title`, `triangle` ([a, b]), `palette`.
- `lines[]`: `at`, `text` (`a^2` → exponente), `check` (expresión a verificar si `text` no es verificable tal cual), `answer`.
- `say[]`: `at`, `text` → subtítulos karaoke sobre el juego.

Ejemplo: `example.json`. Preview: `../../previews/split-runner.mp4`.

## Receta original

prompt verbatim · @goodside · [fuente](https://x.com/goodside/status/2103171088637419631)

> Create a 1 minute video where the right half explains the Black-Scholes formula with voiceover and visuals and the left half plays a generic knockoff of Subway Surfers

Nuestro juego es geometría propia generada con semilla: nada de assets ni parecido con juegos reales. Versión vertical 1080×1920 para Reels/TikTok.

## Referencias

- [@goodside · Black-Scholes + runner](https://x.com/goodside/status/2103171088637419631)

Bloques equivalentes del registro de HyperFrames: `caption-pill-karaoke`, `caption-kinetic-slam`, `caption-highlight`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets. No imitar Subway Surfers ni ningún juego real.
- Receta: Texto de @goodside citado con atribución.
- Esta plantilla: Plantilla original; personaje y escenario hechos con CSS.
