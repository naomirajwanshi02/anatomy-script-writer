---
description: Build a new reel figure from an episode idea
argument-hint: <series> <episode number> <topic>, <analogy or "no analogy"> (series: chip-design, digital-electronics or verilog)
model: opus
---

Build a new reel figure: $ARGUMENTS


Follow these steps in order and stop where told.

Models (quality where it matters, Sonnet everywhere else):
- Opus: steps 1-4 (this command: the spec decides the logic and layout) and step 5 (figure-builder agent: model.ts, geometry, folds).
- Sonnet: step 6 (figure-checker agent: render and look at frames) and the chat itself after my OK (it only hands off and makes small fixes).
- After the check: small fixes (a position, a label, a colour, a timing number, a CSS value) you make directly. A fix to model.ts logic, a race or a fold goes back to the same figure-builder agent with SendMessage (it keeps its context; never start a fresh one for a fix). Start a fresh builder for each new episode so it stays small.
- Keep hand-offs short: pass the approved spec, slug, reference folder and paths, not the conversation.
- Batch my feedback: collect every requested change into one hand-off per round.

Series table (pick the row from the first argument; default chip-design):

| series | episode list | output folder | reference figure |
|---|---|---|---|
| chip-design | series/book-concepts.csv (#, hook, question, problem, concept, analogy) | shorts/chip-design/<NN> <question>/ | the newest chip-design figure (see memory chip-design-progress; device with a screen: hex-grouping or bcd-clock; car cluster: twos-complement; appliance with water: parity-wash) |
| digital-electronics | series/digital-electronics.csv | shorts/digital-electronics/<NN> <question>/ | closest in src/figures/ (analogy: latch-race-through-locks) |
| verilog | series/verilog.csv | shorts/verilog/<NN> <question>/ | closest Verilog figure (verilog-wiring-recipe-map, rtl-synthesis) |


1. Read CLAUDE.md fully (not REBUILD.md), plus `rules/analogy.md`, `rules/lamps-wires.md` and, for chip-design, `rules/chip-design.md` (the builder also reads `rules/build.md`). Find the episode row in that series' CSV: number, question, analogy (and problem and concept for chip-design). Chip-design: challenge the CSV analogy before building. The best analogy is an everyday object whose own failure IS the problem on screen (ep 06: a volume knob jumping to 7, not stepping stones). If you change it, propose it in one line; on my OK update the CSV row and the Notion page together.
2. Read only the reference figure's files. Do not scan other figures.
3. Chip-design only: build a STILL SAMPLE first and stop for my OK on the look. A fresh figure-builder agent copies the reference into src/figures/<slug>-sample/ with TWO frozen panels, so the owner approves both looks in one go (2026-11-02: ep 17's circuit was rebuilt twice because it was first seen only in the finished reel): panel 1 the analogy start frame (board, object, callout, colour pop, branding), panel 2 the circuit's key-state frame in the digital electronics CMOS design (rails, lever, PMOS/NMOS valve blocks, glass output tank, DE-style readouts showing the key numbers); no timeline or folds. Two separate pages or one page with a ?panel=2 switch are both fine. It outputs testers/<slug>-sample.html, and renders one check frame from a copy in C:/TEMP/check/ WITHOUT --transparent, so the sepia paper shows (an alpha PNG looks white in viewers) (capture.mjs writes a .mov next to the page it renders, so never render inside shorts/ or testers/). Show me both frames. Iterate on the sample only until I approve both looks; at most 2 fix rounds before asking me how to proceed.
4. Write a short spec and STOP for my OK:
   - parts (at most ~8) and where they sit. The board is always on screen; an analogy puts a recognisable model of the everyday object (desk phone, tap, thermostat, car cluster) on it (CLAUDE.md section 5, first bullet; `rules/analogy.md`). Name the colour pop of the opening frames and any callout plate for details too small to read. Allowed colours only (sections 2-3; dashboard lamps may be yellow, red or blue, never green or olive).
   - fonts (chip-design): Type Machine on the board and its parts, JetBrains Mono on screens and callout LCDs, Oxanium in readout tables (`rules/chip-design.md`)
   - branding: the board-face ROLLIN engraving, plus one in-story ROLLIN spot if the analogy object naturally shows a name (caller ID, maker's plate, brand badge); say where
   - timeline with times (lever moves, folds), loop length, start = end state
   - what is rust (active) and which lamps light when; the key state and how long it is held (at least 4 s)
   - the CLAUDE.md section 7 rule or arithmetic it must satisfy, computed in model.ts
   - chip-design: no without-it scene (`rules/chip-design.md`): analogy, fold, explanation, fold back
   - chip-design circuit half: the digital electronics CMOS design language (reference: the DE 05 and DE 08 pages in shorts/digital-electronics/, and src/figures/cmos-inverter-taps/): rails, lever, PMOS/NMOS valve blocks, glass output tank, DE-style table, graph and meter readouts. The analogy gives the concept, never the objects (no stairs, buckets or drops built into the circuit).
5. After my OK: hand the approved spec, the slug, the reference folder (for chip-design: the approved sample plus the reference figure) and the output path to the figure-builder agent (the sample's agent if it is still small, otherwise a fresh one). It copies into src/figures/<slug>/, changes only what the spec needs, adds src/main-<slug>.tsx, builds/build-<slug>.mjs and the npm script, outputs to <output folder>/<question>[ (<analogy>)].html, runs the build, renders a check from a copy in C:/TEMP/check/ (without --transparent), and confirms every used identifier is imported (esbuild does not catch missing imports; a missing one renders a blank page).
6. Look at 2-3 key frames yourself (key state, fold, loop end) at scale 0.5. Run the figure-checker agent only before the final export or when I ask. Fix what it reports (at most two rounds, see Models above). Reply in at most 5 lines.
7. Chip-design: the script goes on the episode's Notion page (book-concepts.csv database) when I ask for it, per SCRIPTS.md, with the series line "This is episode N of teaching you chip design, one problem at a time."
