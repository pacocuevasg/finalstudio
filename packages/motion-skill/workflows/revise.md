# Workflow: revise an existing video

1. **Locate the change.** Ask for (or infer) a timecode and a beat: "at
   00:09:10 hold the mark 12 frames longer" is actionable; "make it better"
   gets one clarifying question with 2–3 concrete options.
2. **Edit the spec, not the output**, when the project came from a template:
   change the field, rebuild. Hand-edit `index.html` only for custom pages.
3. **Keep the rest still.** Change one beat; later beats shift only when the
   duration must change (then re-align voice and re-run `timing.mjs`).
4. **Re-verify the touched part:** `check.mjs`, then `sheet.mjs --at` the
   changed moments and their neighbours, then the full render and `verify.mjs`.
5. Report what changed with timecodes, and the new duration if it moved.
