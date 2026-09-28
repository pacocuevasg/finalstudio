# Workflow: data story (a spreadsheet → one point, told with numbers)

1. **Load the data yourself** (CSV/XLSX → a table in code). Print shape, a few
   rows, and the columns you will use. Never read numbers off a screenshot.
2. **Find the point.** One sentence: "sales grew 38 % because of notebooks".
   Compute every number the video shows (totals, %, deltas, ranks) with code
   and keep the computation. Round only for display.
3. **Beats:** hook (the headline number) → where it comes from (2–3 bars or
   parts, staged) → the one comparison that matters → what to do with it.
4. **Template:** `data-counter`. Give it raw values; it computes totals, % and
   deltas and stops the build when a stated number disagrees.
5. **Staged transitions:** move first, then transform. Each bar or cell keeps
   its identity from beat to beat (same color, same position logic).
6. Build → check → sheet → render → verify. In the sheet, re-read every number against your computation.

Rules: no 3D pies, no dual axes, no invented series; label sample data as
"ejemplo" on screen when the user hasn't given real numbers yet.
