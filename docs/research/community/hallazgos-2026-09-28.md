# Comunidad: Opus 5.5 y motion design (ronda 2, 28 sep 2026)

Complementa `research/opus-motion-design/informe.html`. Aquí solo va lo nuevo.

**Límite de acceso:** X sigue bloqueado desde la nube (x.com por robots.txt; fxtwitter y vxtwitter con 403 en el proxy). Todo lo de X viene de títulos y fragmentos que muestran los buscadores o de galerías que lo citan. Sin leer: el curso de @0xMovez, el curso de @neil_xbt ("Opus 5.5 as Your Marketing Video Director"), el hilo de @rexan_wong con "el flujo que sí funciona", y el post de @achxvi que Paco recomendó. El artículo de Charlie Hills en Substack está detrás de suscripción y pasqualepillitteri.it bloquea lectura.

## 1. Lo más útil para el proyecto

### Patrón "audio como reloj maestro" (confirmado en 3 proyectos independientes)
- La narración se genera primero, se alinea por palabra (Whisper / faster-whisper) y ese `timing.json` dirige toda la animación.
- agentic-motion-graphics (MIT, HyperFrames): TTS → recorte de silencios con FFmpeg y tempo 1.05–1.1x → `timing_aligner.py` → GSAP atado a los tiempos → `hyperframes lint` → `hyperframes snapshot` para que el modelo revise frames → render 1080p/4K normalizado a -14 LUFS. Música de fondo sintetizada a 120 BPM con NumPy (sin licencias).
- video-talkcraft: "cada beat de movimiento se ancla a un carácter exacto" (alineación a nivel de carácter).
- MathLens: TTS → "validación de audio" → actualiza el storyboard con los tiempos reales antes de escribir el código.
- **Para nuestra skill:** el paso Voz del informe debe producir un `timing.json` estándar que consuman todas las escenas.

### Verificación antes de animar (lo que pidió el informe, ya resuelto por otros)
- MathLens tiene `assert_geometry()`: verifica coordenadas de las figuras antes de renderizar para no dibujar diagramas incorrectos. Flujo de 8 pasos: análisis matemático → visualización HTML/SVG anotada → storyboard → TTS → validación de audio → andamiaje Manim → escenas → render con autocorrección.
- motion-graphics-skills (Charlie Hills): regla "los hechos salen solo de una lista aprobada por el usuario; nada de datos inventados".
- Hacker News: el riesgo real en explicadores es que Opus "usa vocabulario interno que se inventa"; hace falta una revisión antes de entregar.
- **Para nuestra skill:** un paso `facts.json` (datos, fórmulas y resultado verificados) que el storyboard solo puede citar, más asserts de geometría y números.

### Sistema "anti-PowerPoint"
- video-talkcraft define 7 capas para que un frame nunca quede quieto: curva de cámara continua, planos de parallax, ciclo de vida idle/yield de cada elemento y capa de ambiente que "respira". Además detecta automáticamente frames congelados y revisa defectos de un solo frame.
- Es la respuesta directa a la crítica de HN de que muchos videos son "slides simples con mal copy".

### Reglas de oficio listas para copiar (motion-graphics-skills, MIT)
1. Hechos solo de listas aprobadas.
2. Marca desde `brand.md` + `MOTION.md` generados por una skill de intake.
3. Prohibido por defecto: efecto máquina de escribir, rebotes, texto con degradado.
4. Animación "en dos" (24 fps con holds de 2 frames).
5. El gancho en los primeros 3 segundos.
6. QA: un frame por toma revisado por desborde de texto y exactitud.
7. Logos y capturas solo de archivos reales, nunca UI inventada.

## 2. Repositorios nuevos que vale la pena conocer

| Repo | Qué aporta | Licencia | Uso para nosotros |
|---|---|---|---|
| [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | 13 skills encadenadas (brand-intake, motion-brief-writer, vox-explainer, animated-chart, reel-export…). Cada SKILL.md tiene frases gatillo, entradas requeridas y "reglas aprendidas a la mala". | MIT | Plantilla de estructura para nuestras skills; `brand-intake` → `MOTION.md` equivale al `frame-tokens.md` del informe |
| [siyuanfeng636-cpu/agentic-motion-graphics](https://github.com/siyuanfeng636-cpu/agentic-motion-graphics) | Pipeline completo en HyperFrames con Whisper, TTS, snapshots y loudness | MIT | Referencia directa del paso voz → timing → escenas → QA |
| [shuyicc/MathLens](https://github.com/shuyicc/MathLens) | Foto o texto de un problema de mate → video Manim narrado, con verificación geométrica | CC BY-NC 4.0 (no comercial) | Modelo del workflow `solve-step`; no copiar código |
| [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | 78 "recetas de movimiento" con preview HTML y galería buscable, sistema anti-PowerPoint, QA de 3 niveles | PolyForm Noncommercial | Idea de galería de escenas; no copiar código |
| [znyupup/knowledge-explainer-skill](https://github.com/znyupup/knowledge-explainer-skill) | Markdown → video Remotion con 6 plantillas (Title, ContentCard, TwoColumn, Triangle, BeforeAfter, Outro) + carpeta `custom/` para componentes nuevos | MIT | Prueba de que "apuntes en markdown → video" funciona con pocas plantillas |
| [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | Explicador estilo Vox en collage de papel. Dos puertas humanas: aprobar beats y elegir entre 3–4 estilos renderizados ("style bake-off") | MIT | El bake-off de estilos es buena UX para el producto |
| [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | Buenas prácticas de Manim CE y ManimGL como skill | MIT | Motor alterno para matemáticas puras |
| [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | Índice de 178 repos con calificación de seguridad; 32 son explicadores | — | Punto de partida para próximas rondas |
| [athemeroy/awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos) | 1,000+ videos, 893 clasificados por estilo y método | — | Datos de estilos (abajo) |

## 3. Qué estilos está haciendo la gente (893 videos clasificados)
3D 297 · motion graphics/UI 222 · cartoon plano 141 · pixel art 52 · dibujado a mano 38 · recorte de papel 35 · tinta/arena/pintura 31 · generativo 20 · anime 19 · diagramas matemáticos 15 · fotorreal 14.
Lectura: los diagramas matemáticos casi no se han explorado (15 de 893). Hay espacio para destacar con tutoriales.

## 4. Casos educativos nuevos (de galerías que citan X)
- @LinearUncle: lección de derivadas con Manim + edge-tts. Prompt: "请用Manim给我制作一个导数概念学习的视频，要求通俗易懂，并且有例子" (haz con Manim un video para aprender el concepto de derivada, fácil de entender y con ejemplos). La galería avisa que la exactitud de la materia requiere revisión aparte.
- @0x0funky: lección de inglés de 6 minutos hecha desde material de curso preparado (Remotion + React/SVG + CosyVoice local). El caso más cercano a "subo mis apuntes".
- @ng169onX: explicador de VAE de 5.5 minutos con fórmulas y diagramas (Qwen3-TTS).
- @addyosmani: "How Browsers Work" animado en JS.
- @AxtonLiu: convierte un video de cabeza parlante en B-roll de line-art que sigue lo que se dice.
- @goodside, prompt completo del inicio: "Create a 1 minute video where the right half explains the Black-Scholes formula with voiceover".
- @polydao (Mr. Buzzoni): el prompt de showreel con duración como variable "[24]" y la nota "stock Claude Code, Opus 5.5 on max reasoning, memory off".
- @twoclipping publicó su plantilla con un bloque `<inputs>` que primero pide "8 a 12 estados de UI en los que se convierte la forma". Patrón: el prompt entrevista antes de construir.
- Prompt de @Ror_Fly completo: "render a recipe motion graphic from an empty glass to a finished cocktail, explainer style, ingredients and measurements going in, 30 seconds, using 'javascript or html (w/e you think will produce the best)'". Dejar que el modelo elija el medio funcionó.

## 5. Otros datos
- Costo reportado en HN: un explicador completo con Opus 5.5 + $3.21 de API de imágenes (OpenRouter).
- Subtítulos: dos caminos. Guion primero (tiempos del TTS) o audio primero (Whisper → SRT, y Claude corrige nombres propios). Definir márgenes seguros y tamaño máximo de fuente en el prompt para evitar desbordes (apiyi.com).
- Opus como director de modelos de video: @abxxai (GPT Image 2.5 + Seedance 2.5), @OriSilver (blockout en Blender → Seedance vía MCP), @gavinpurcell (documental vía Runway MCP).

## 6. Cambios sugeridos a la skill (propuesta, no aplicada)
1. Añadir `references/audio-timing.md`: formato estándar de `timing.json` y reglas de alineación por palabra.
2. Añadir `references/facts-gate.md`: `facts.json` verificado + asserts de geometría y números antes de animar.
3. Añadir a `principles.md` las 7 reglas de oficio y la lista de prohibidos por defecto.
4. Añadir a `qa-checklist.md`: detección de frames congelados y revisión de un frame por toma.
5. Para el producto: puerta de "style bake-off" (3 estilos de muestra) y aprobación de beats antes de renderizar.
6. Evitar reutilizar código de MathLens y video-talkcraft (licencias no comerciales); solo ideas.

## Fuentes
- https://github.com/charlie947/motion-graphics-skills
- https://github.com/siyuanfeng636-cpu/agentic-motion-graphics
- https://github.com/shuyicc/MathLens
- https://github.com/Vincentwei1021/video-talkcraft
- https://github.com/znyupup/knowledge-explainer-skill
- https://github.com/Alisa0808/vox-director
- https://github.com/adithya-s-k/manim_skill
- https://github.com/zhuyansen/awesome-claude-video-skills
- https://github.com/athemeroy/awesome-opus-5-5-videos
- https://github.com/X-RayLuan/awesome-opus-5-5-video-prompts
- https://news.ycombinator.com/item?id=49836374
- https://help.apiyi.com/en/claude-opus-5-5-code-to-video-guide-en.html
- https://sloptvnews.com/opus-5-5-negroni-explainer-html-motion-graphics-iteration/
- https://www.howtouselinux.com/post/everyones-making-videos-with-opus-5-5-so-why-do-some-people-get-magic-and-others-get-meh
- Títulos/fragmentos de X vía buscador: @polydao, @twoclipping, @rexan_wong, @neil_xbt, @0xMovez, @pankajkumar_dev
