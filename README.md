# FinalStudio

Sube tus apuntes. Recibe el video que te lo explica.

Un estudiante escribe o sube un ejercicio, Claude lo resuelve y **comprueba la
solución con código antes de animar**, la voz se genera primero y fija los
tiempos, y la skill `motion-studio` graba el video en el estilo de Pocketsflow (papel blanco,
tutor en dither de 1 bit, globo mono, etiquetas `// 01 — hook`).

## Cómo está armado

```
apps/web/              Next.js: las 4 pantallas del plan (materia, ajustes, storyboard, reproductor)
packages/core/         storyboard v2, verificación, voz, línea de tiempo, render
  src/storyboard.ts    esquema que escribe Claude: escenas con "say" y {{anclas}}, sin tiempos
  src/verify.ts        comprueba cada ecuación del pizarrón con la solución
  src/planner.ts       ejercicio → storyboard con Claude Opus 5.5 (reintenta si la cuenta no cuadra)
  src/voice/           proveedores de voz intercambiables
  src/timeline.ts      voz primero: anclas → segundos, visuales 2 frames antes de la palabra
  src/render.ts        spec → skill (engine/build.mjs) → MP4 (scripts/render.mjs) + capítulos + .vtt
packages/motion-skill/ la skill motion-studio: única fuente. Motor sin npm, 20 plantillas + tutor
                       halftone, verificador, render con Chrome + FFmpeg (ver su SKILL.md)
worker/                render local (CLI) y worker de la cola en Supabase + Dockerfile
supabase/migrations/   tablas, RLS, buckets y cola de render
examples/              storyboard de ejemplo (2x + 3 = 11)
docs/                  investigación y plan (ver docs/README.md)
```

## Voz

| `VOICE_PROVIDER` | Para qué | Tiempos por palabra | Licencia |
|---|---|---|---|
| `estimate` | tests, sin audio | estimados | — |
| `kokoro` | desarrollo gratis, CPU (`pip install kokoro-onnx soundfile`) | estimados y ajustados al audio real | Apache-2.0 |
| `elevenlabs` | producción (recomendado en el informe de audio) | reales, por carácter | comercial |
| `voicestudio` | pruebas locales con VoiceStudio | estimados | app AGPL; pesos OmniVoice **CC-BY-NC**, no comercial |

## Correr en local

```bash
npm install
cp .env.example .env            # ANTHROPIC_API_KEY opcional: sin ella usa el ejemplo
npm test                        # verificación, anclas, alineación, wav, build con la skill
npm run skill:check             # construye y revisa las 21 plantillas de la skill
npm run render -- examples/ecuacion-lineal.v2.json out/ecuacion      # MP4 desde la terminal
VOICE_PROVIDER=kokoro npm run dev                                    # app en http://localhost:3000
```

Requiere Node 22, FFmpeg y Chrome o Chromium (se detecta solo, o `MOTION_CHROME`).
`node packages/motion-skill/scripts/doctor.mjs` dice qué falta. HyperFrames ya no es necesario para
renderizar; solo lo usa la voz Kokoro de desarrollo (`hyperframes tts`).

## Usar la skill en Claude

`packages/motion-skill/` es una skill completa (`SKILL.md` + scripts). Para Claude Code, cópiala o
enlázala en `~/.claude/skills/motion-studio`; para claude.ai, comprime la carpeta y súbela en
Configuración → Capacidades → Skills.

## Producción (pendiente de cuentas)

1. Proyecto de Supabase: `supabase db push` aplica `supabase/migrations`.
2. Worker de render: `docker build -f worker/Dockerfile .` con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y la voz.
3. La app web en Vercel con `ANTHROPIC_API_KEY`.
