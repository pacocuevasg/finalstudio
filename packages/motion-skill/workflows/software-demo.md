# Workflow: software demo (how to do X in an app, a site, or a terminal)

1. **Write the real procedure** step by step: clicks, keys, what appears.
   For code, run the commands and keep the real output.
2. **Pick the stage:**
   - Spreadsheet or app UI → `ui-cursor-demo` (generic UI, giant cursor,
     camera push to the cell being edited; `expect` checks formulas per row).
   - Terminal, git, Python → `terminal-code` (typing is allowed here: it is what a terminal does; output pasted from a real run).
3. **One caption per step**, numbered, plain words ("Escribe =B2*C2"). The
   caption leaves before the next arrives.
4. **Camera:** push in to the thing being changed, pull back to show the
   result. Never cut away from the cursor mid-action.
5. **Interfaces are generic.** Recreate the shape of a spreadsheet or a
   terminal; never copy a real product's logo or pixel-exact UI.
6. Build → check → sheet → render → verify.

The "one shape, never cut" pattern (one element morphing between UI states on
a 120 BPM grid) suits short feature teasers: see `one-shot-morph`.
