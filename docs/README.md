# Documentos

Lo que se investigó y decidió antes y durante el MVP. Los HTML se abren tal cual en el navegador.

| Archivo | Qué es | Versión publicada |
|---|---|---|
| `research/opus-motion-design/informe.html` | Cómo hacer motion design con Claude: motores, patrones, estilo Pocketsflow | — |
| `research/audio/informe-audio.html` | Voz, música y SFX: proveedores, licencias, tiempos por palabra | https://claude.ai/artifact/7Knh6hBVQqMKj2tAMJNbiX |
| `research/papers-reddit/informe.html` | Papers y comunidad sobre video educativo animado | — |
| `research/community/hallazgos-2026-09-28.md` | Primera ronda de la investigación semanal en X | — |
| `plan/plan-plataforma-estudio.html` | Plan de la plataforma de estudio (pantallas, arquitectura, costos, decisiones) | https://claude.ai/artifact/Bv2joG84TCv3NjCmLubd5n |

## Videos de muestra de las plantillas

Los MP4 de muestra de las 20 plantillas (≈100 MB) **no están en git**: cualquiera se regenera desde el repo con

```bash
node packages/motion-skill/engine/build.mjs packages/motion-skill/templates/<plantilla>/example.json out/<plantilla>
node packages/motion-skill/scripts/render.mjs out/<plantilla> -o renders/<plantilla>.mp4
```

En git quedan las hojas de contacto (`packages/motion-skill/templates/_previews/*-sheet.jpg`). El catálogo
visual con los videos está en https://claude.ai/artifact/SwDogYKfUn2fXRriPXp6T3.
