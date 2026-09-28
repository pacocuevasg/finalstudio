# Sources: what each skill taught this one

Researched 2026-09-28 by cloning each repository and reading its SKILL.md,
references and scripts. License decides what we could take: ideas from all,
text or code only from permissive ones, always credited.

| Skill | License | Took |
|---|---|---|
| heygen-com/hyperframes (skills/, 21 skills) | Apache-2.0 | the composition contract; router-by-deliverable with ambiguity rules; gates per step; "storyboard is a proposal" table and reverse-iceberg story spine; lint vs check split; persistence-aware findings (a finding seen at one sample is transient); frozen-timeline detection; contrast audit; contact sheet at beat midpoints |
| smwbev/framewright | MIT | self-containment as a principle; a checker that renders frames in several orders and demands identical pixels; "verify by looking at frames, never by imagining"; one-scene-at-a-time loop; read the waveform because you can't listen |
| charlie947/motion-graphics-skills | MIT | "one object changing shape reads as premium", ghost of the start state, stagger by a beat, the loop test (0 = end; 0, 1, 2.2 differ), label invented numbers as examples |
| bangtutorial/bang-motion | MIT | mechanical anti-slideshow tests (count faded sections, text levels, Ken Burns alone, uniform seams) |
| siyuanfeng636-cpu/agentic-motion-graphics | MIT | TTS → Whisper word timing → timeline; loudness target check; duration vs audio check |
| remotion-dev/skills | no license file (Remotion itself needs a company license) | router-of-rules shape: one small SKILL.md pointing to many rule files loaded on demand |
| digitalsamba/claude-code-video-toolkit | MIT | brand folders and project templates; long-job progress reporting |
| znyupup/knowledge-explainer-skill | MIT | markdown → fixed layouts first, custom components only when needed |
| Vincentwei1021/video-shotcraft | Apache-2.0 | shot recipe cards as the unit of reuse; first shot approved before the rest |
| Vincentwei1021/video-talkcraft | PolyForm Noncommercial | *ideas only:* semantic annotation of the script before timing; layer matrix per shot; machine gates then one human review |
| shuyicc/MathLens | no license file | *ideas only:* derive the math facts before any visual; narration keyword anchors drive animation |
| calesthio/OpenMontage | AGPL-3.0 | *ideas only:* capability audit before choosing a pipeline; reference-video analysis as its own entry point |
| adithya-s-k/manim_skill | MIT | composer → scenes.md plan before code (3b1b style) |
| Alisa0808/vox-director | MIT | cadence rules (how long shots last) and a beats.json schema |

## What none of them had, and this skill adds

- Fully offline: no `npx` fetch, no cloud TTS/BGM, no CDN, no registry; a
  pipe-driven Chrome renderer with zero npm dependencies.
- Facts gated in the builder for every template that shows numbers.
- A determinism test that found real seek-order bugs in our own templates
  (`references/determinism.md`).
- Education-first rules from learning-science papers (`references/pedagogy.md`).

## Project research this builds on

- `research/opus-motion-design/informe.html` (Opus 5.5 community practice)
- `research/papers-reddit/informe.html` (learning science, AI animation papers, Reddit)
- `research/audio/informe-audio.html` (voice, alignment, loudness)
- `research/community/hallazgos-2026-09-28.md`, `templates/research-trending.md`
