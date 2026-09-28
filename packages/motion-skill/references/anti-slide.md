# Not a slideshow: mechanical tests

Models (and tired designers) fall back to slides with fades. Check the code
and the sheet, not your feelings. Fail one test and restructure before anyone
sees it. (Adapted from the "PPT tests" in bangtutorial/bang-motion, MIT.)

1. **Sections that fade.** Three or more scenes that are containers switched
   on and off with opacity is a deck. Scenes should change because something
   moves: the camera pushes, one element transforms into the next, the board
   grows, the cursor travels. Exception: a worked exercise where the board
   accumulates lines (the history is the point).
2. **A through-line.** One element survives across beats: the tutor, the
   board, the cursor, the glass, the number. No survivor → a deck.
3. **Two text levels at most per beat.** Kicker + title + body is a slide.
   Keep one big thing (a word, a number, an equation) and one small label.
4. **Ken Burns alone is not motion.** A 1.0→1.05 scale on a still is a slide
   with a zoom. Something in the frame must act.
5. **Vary the seams.** Every cut being fade + scale is a template. Use a push,
   a morph of the outgoing element, a hard cut on the beat, a whip.
6. **The hold is alive.** In any still longer than ~2 s, one small thing
   keeps moving: breathing character, blinking caret, a progress bar, the
   push-in. The checker flags frozen stretches.
7. **One object changing shape reads as premium.** A button that becomes the
   player, bars that become a line, a card that becomes a window. A fade from
   one picture to another reads as cheap. Leave a faint ghost of the start
   state so the eye can follow. (From charlie947/motion-graphics-skills, MIT.)
8. **Stagger by a beat.** Rows, letters and dots start a fraction apart
   (0.05–0.16 s). Everything moving at once reads as a slide transition.

In teaching videos the tests bend toward clarity: a board that fills line
by line is right even though it "only adds text", because the order is the
reasoning. Decoration never bends them.
