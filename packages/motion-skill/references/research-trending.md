# Templates trending de motion design (Opus 5.5) · investigación

28 sep 2026. Complementa `research/community/hallazgos-2026-09-28.md` y
`research/opus-motion-design/informe.html`; aquí solo va lo nuevo.

## Cómo se resolvió que X no se puede leer desde la nube

X sigue bloqueado (robots.txt y 403 en los espejos). En lugar de leer X, se usaron
fuentes que ya catalogaron esos videos, con enlace al post original:

| Fuente | Qué aporta | Licencia |
|---|---|---|
| [muhammedsevimli/montaj](https://github.com/muhammedsevimli/montaj) | 260 videos de lanzamiento etiquetados a mano por estilo, fondo, tempo y técnica, con vistas, duración, descripción del look y una "nota de receta" por video. 214 vienen de whatships.com y 46 son videos Opus 5.5 del 25–26 sep | Código MIT; datos de whatships MIT |
| [dingyi/whatships.com](https://github.com/dingyi/whatships.com) | 2,159 videos de lanzamiento de X con póster y cita | MIT (el sitio no carga desde la nube; el repo sí) |
| [heygen-com/hyperframes · registry](https://github.com/heygen-com/hyperframes/tree/main/registry) | 394 bloques y componentes; varios nacieron de un "X expert demand study" (iris reveal, whip pan, scroll camera, spring stack, vox annotate) | Apache 2.0 |
| [X-RayLuan/awesome-opus-5-5-video-prompts](https://github.com/X-RayLuan/awesome-opus-5-5-video-prompts) | 48 ejemplos con prompts verbatim | Lista MIT; los prompts son de sus autores |
| [NewTurn2017/make-awesome-video](https://github.com/NewTurn2017/make-awesome-video) | Skill que dirige videos de lanzamiento: referencias → 3 storyboards → stills → render → notas de director; motion kit determinista | MIT |
| yihui-dev, opusvideo, BeatAPI, real-leo (listas awesome) | Índices cruzados; confirman los mismos casos | varias |

Pendiente para una próxima ronda: el endpoint `whatships.com/search-index.json`
(2,159 registros) si algún día carga desde la nube, y las 260 notas de Montaj en
español para el producto.

## Qué está en tendencia (cifras)

- **Montaj, 260 referencias:** interfaz 159 · tipografía cinética 98 · 3D 59 · cinemático 41 · abstracto 40 · editorial 39 · datos 34 · collage 32 · ilustración 28 · producto 22 · pixel 19 · terminal 18.
- **Técnicas:** corte seco 74 · cámara 3D 68 · acercamiento 55 · tecleo 53 · cursor 46 · deslizamiento 43 · retícula 39 · morph 35 · contador 34 · partículas 30 · máscara 29.
- **Fondo:** claro 107, oscuro 108, color 45. **Tempo:** medio 145, rápido 67, tranquilo 48. **Formato:** horizontal 230, cuadrado 20, vertical 10. **Duración mediana:** 30 s.
- **Combinación más común:** interfaz + tipografía cinética sobre fondo claro a tempo medio.
- **Más vistos de la ola Opus 5.5:** showreel de @himanshutwtxs (236k), Fluid de @motion_conquest (85k), video de perfil de @superalesha (39k), AI Superpowers (26k), Kody de @kentcdodds (23k), Develop de @twoclipping (18k).
- **Más vistos del catálogo general:** lanzamientos de Claude (78M, 57M, 50M, 26M), Grok, Figma, ChatGPT.

Lectura para FinalStudio: lo viral es interfaz + tipografía con cortes secos. Casi
nadie hace educación con esas gramáticas; ahí está el hueco.

## El flujo de 6 pasos que usan los creadores (Rexan Wong, vía Montaj)

La investigación previa no pudo leer este hilo; Montaj lo adapta completo.

1. **Referencia.** Elige 1–2 videos y pide imitarlos. Sin referencia Opus vuelve a su default: texto centrado, degradado y todo apareciendo con fade.
2. **Motor.** HyperFrames o Remotion: cada cuadro queda fijo y un cambio es editar una línea.
3. **Componentes reales.** Botones y tarjetas reales (21st.dev, shadcn) o capturas reales; la UI inventada se nota en un segundo.
4. **Todo el contexto.** Marca, capturas, referencia y una nota; pide 3 storyboards distintos.
5. **Stills antes de animar.** Un cuadro por escena con su "trabajo": qué debe entender el espectador en ese momento.
6. **Notas de director.** No interrumpir; al ver el render, dar notas en lenguaje de cámara ("todos los zooms a 0.7×", "aquí corte seco", "acércate al botón").

`make-awesome-video` lo convierte en 4 puertas humanas: referencias, storyboard,
stills y notas.

### Glosario de notas de director (de Montaj)

| Término | Nota de ejemplo |
|---|---|
| push in | acércate al botón en 0.8 s con ease-out a 1.15× |
| pull out | aléjate a 0.85× para ver toda la interfaz |
| hard cut | quita la transición entre la escena 3 y 4 |
| match cut | corta con el círculo del logo en la misma posición que el botón siguiente |
| mask reveal | abre el titular con máscara rectangular de izquierda a derecha en 0.5 s |
| whip pan | transición con barrido horizontal de 0.25 s y desenfoque |
| stagger | tarjetas cada 60 ms, subiendo 12 px |
| overshoot | 8 % de rebase en la entrada y luego asienta |
| ease out | `cubic-bezier(0.16, 1, 0.3, 1)` en todas las entradas |
| speed ramp | primeros 0.2 s rápidos, luego 0.3× |
| hold | 1.2 s de pausa tras cada titular |
| parallax | fondo a 0.4× de la velocidad del primer plano |
| rack focus | pasa el foco del fondo a la tarjeta en 0.6 s |
| beat sync | cortes cada 2 tiempos a 120 BPM |

## Qué se propone para el producto

- **Selector de estilo** con las 19 plantillas implementadas (ver `catalog.json`); el mismo storyboard se puede renderizar en 3 estilos para que el alumno elija.
- **Notas de director como UI:** botones "más lento", "corte seco aquí", "acércate" que editan parámetros de la plantilla, en lugar de un chat libre.
- **Nunca inventar UI ni datos:** las plantillas calculan los números y fallan si no cuadran.
