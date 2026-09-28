# Pedagogy rules for tutorial videos

Source: research/papers-reddit/informe.html (multimedia-learning papers, and
Reddit threads from r/manim, r/ClaudeAI and r/notebooklm). These rules override
style choices whenever the video teaches.

1. **Every motion explains something.** No decorative particles or flourishes. Keep ambient motion (a slow push-in, the tutor breathing) barely perceptible.
2. **Signalling kit.** Highlight, annotate, point, zoom and dim the rest, synced to the word that names it. In solve-step this is the inverted `[mark]` plus dimming earlier lines.
3. **The voice explains, the screen shows.** On screen go key terms, formulas and data. Never repeat whole sentences as text.
4. **Build, don't pop.** Formulas, diagrams and tables are drawn step by step, in the order of the reasoning.
5. **Short segments.** 6 min at most, split into steps with a pause point between them.
6. **End with 2–3 check questions or a mini quiz** (on the platform, after the video).
7. **Checkable claims per scene.** The storyboard carries conditions that can be verified (the `solution` math check), and a visual review of frames happens before the final render.
8. **Staged data transitions.** Move first, then transform. Each bar or cell keeps its identity.
9. **Cite the student's notes.** Every number or claim on screen links back to where it came from in the uploaded material (planned field `source` per board line).
10. **Local, plain-language edits.** Change one scene or element without redoing the rest.
11. **Art direction before animation.** Pick the style, palette and recurring element first.
12. **Fast draft, careful final.** Preview in seconds (snapshots or `-q draft`), then render the final. Voices must be natural and selectable.
