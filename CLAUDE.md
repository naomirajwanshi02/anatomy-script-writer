# Reel figure project: working rules

This project makes short isometric explainer figures for a digital electronics Instagram Reels and YouTube Shorts series (9:16, about 10-30 s each, one interview question per reel). Each figure is screen-recorded and drawn over on an iPad, so clarity at phone size matters more than detail. Read this file fully at the start of every session. Topic rules live in `rules/` and are read only when the task needs them:

| File | Read it for |
|---|---|
| `rules/chip-design.md` | any chip-design figure, script or reel (fonts, story shape, analogy choice, hook) |
| `rules/analogy.md` | any figure with an analogy object (objects on the board, device screens, effects) |
| `rules/lamps-wires.md` | building or checking a figure (glass bulbs, warning lights, LED strips, levers, wire and strap styles, wire visibility) |
| `rules/build.md` | building, rendering or checking a figure (code layout, kit quirks, entrance, capture, output paths, backdrop, sepia blocks) |
| `rules/notes.md` | notes overlay, subtitles, engraving on notes pages, reel MP4, `reel-builds.csv` |
| `SCRIPTS.md` | any script, voiceover, hook or drawing plan |
| `REBUILD.md` | only when `src/` is missing or an old figure must be rebuilt from its built page |

## 1. How to work (saves usage, protects what already works)

- Never rebuild or regenerate an existing figure. Edit in place and change only what the request lists. "Everything else stays unchanged" is always implied.
- If I say "copy" a figure into a new one, duplicate its folder under the new name and leave the original untouched.
- First draft only. Skip review, polish, extra verification passes, screenshots and self-critique rounds unless I ask. Run only the build.
- Prefer changing a figure's own files (parts, positions, timed events, captions) over touching shared components. Touch shared components only when a part is truly missing, and say so.
- Do not add dependencies, restructure folders, rename files or "improve" code I did not ask about. If you think something should change, mention it in one line and wait.
- Before editing, read only what you need: this file, the README, the topic file the task needs, and the one figure involved. Do not scan the whole project. If `src/` does not exist yet, see `REBUILD.md` (rebuilding from the built pages).
- Do not run git commands and do not create backups unless I ask; I copy the folder myself.
- Everything happens on this laptop: build the HTML, render the .mov with `builds/capture.mjs`, edit in Premiere. There is no file-transfer step. Never use certutil or any encode/decode, base64 or zip-to-text trick, and never suggest one.
- Keep replies short: what changed (files), and what I should check on screen. Maximum 5 lines. Do not restate the request.
- If a request conflicts with correct logic or physics (see section 7), say so in one line before building and propose the correct version.
- If a request is cut off or genuinely ambiguous (it could produce two different figures), ask one short question before building instead of guessing.
- If I say "revert", restore the previous version exactly. Make edits as precise text replacements so they can always be reversed.

## 2. Style (sepia paper, single theme)

- One theme only: sepia. No dark or light build. Match the current sepia NAND gate figure (episode 04) exactly in look and feel.
- Page, card, paper and halo: #efe3c8 (warm paper). The grid backdrop is a separate video (`rules/build.md`); figures render with `--transparent`.
- Ink: hi #3b2a1a, mid #8a7356, lo #b9a47f, faint #d8c8a6, lit #1e140a.
- Surfaces: face #f6ecd6, top #fbf3e2, lit-top #fff8ea, lit-shade #ecdcbc, shades #d9c5a0 #e2d0ad #eadbbd #f1e5cb.
- Text: body #5a4630, strong #2a1d10, muted #9a8466. Dimmed or inactive text uses lo (#b9a47f). Table row highlight: #3b2a1a at about 10 %.
- Font: the monospace already used by the NAND gate figure. Labels in sentence case or all caps as in that figure. No emojis. Chip-design uses its own fonts (`rules/chip-design.md`). Annotations and handwriting in every series are Samble (`samble/samble.otf`).
- Frame (current standard): every figure is a full 9:16 frame (1080x1920) on paper, no card, border or outline. The board spans about 95% of the frame width, centred; readouts (truth table, graph, counter) sit below the board, large enough to read on a phone. No "Fig N" label, legend or caption paragraph.
- Video line weights, in frame pixels (1080 wide): outlines 1.8, wire traces 2.6, flow dots 3.4 with a 4/12 dash, lever rods 5, sparks 3.2. Thin desktop weights disappear in compressed video.

## 3. Colour rules

- Rust #b5541c marks only what is active: flowing current, the current table row, the active curve, the active counter value. Lighter rust #f0a868 is for the dashes on a solid rust strap and for sparks.
- Yellow #ffc21a is only for lit lamps (glass bulbs; warning lights may also glow red or blue; appliance interiors are white LED strips; details in `rules/lamps-wires.md`).
- Transistor-level figures add exactly two device hues, as in the current CMOS figures: **PMOS blue #2f6fb8** and **NMOS red #c2402f**.
  - The device body carries a light tint of its hue. The gate bar lights in the full hue while that transistor conducts, and shows a faint tint while it is off.
  - Pins, caps, arms and bubbles stay neutral sepia. Use the full hues, not muted ones.
- Red dashed outline #c2402f is used only as a warning marker: series-PMOS cost, a glitch dip, the invalid state. The "warning only" rule applies to dashed outlines, not to the NMOS hue. **Red dashed warning outline:** stroke 4.5 with a 10 6 dash in frame pixels, so it reads at phone size.
- VDD and GND rails are neutral sepia: VDD dark (#4a3726 tint), GND light (#a08a68 tint), each with an engraved VDD or GND label at its left end.
- Water in analogy figures is blue #2f6fb8 and turns into the rust signal as it folds into the circuit (the water kit's `liquidColor`).
- Everything else stays neutral sepia. Never add a new colour. If something needs emphasis, use ink tone (lo, mid, hi, lit) or rust.
- Lever 0/1 marks, if a figure has them, are lit ink (#1e140a) with a pale halo, not rust. Rust stays reserved for current and active items.
- My iPad annotations: words in brown-black #2a1d10, arrows, circles and underlines in olive #4f5d24, pen 3-4 px. Figures never use olive, so the two never mix up.

## 4. Wires and signals

Gate-level wires: a neutral base trace with a rust dotted flow overlay only while the wire carries a 1; CMOS straps turn solid rust while current flows; every wire stays visible and followable at phone size. The full rules (dash pattern, animation, crossings, spacing) are in `rules/lamps-wires.md`; read them before drawing any wire.

## 5. Parts, layout and composition

- **The board is the base of every figure, always on screen; analogy objects stand on it** (how to draw them: `rules/analogy.md`).
- Gate-level topics (logic, latches, flip-flops, timing) use isometric gate blocks with the standard symbol on top. Transistor-level topics (CMOS) use valve blocks between rails plus a glass output tank.
- Levers only for inputs that change. Fixed inputs are flat labels printed on the board (for example B=1). Inputs that change are levers, never LEDs.
- Signals flow left to right in straight rows. Wires never wrap around the board edge. Compare paths by putting them in parallel rows.
- **Labels:**
  - Transistor boards get one PMOS label and one NMOS label per board, each beside its network, not one per transistor.
  - No control pins on transistor blocks in multi-device boards (too crowded). Single-device boards (the inverter) keep their pins, with a bubble on the PMOS pin.
- **Overbars:** S̄, R̄ and Q̄ do not render in the board font. Engrave the plain letter and draw the overbar as a short engraved line above it.
- **Placement:** at the current camera (azimuth 62), tall parts such as tanks, lever bases and lamps hide anything behind them on the board. Put labels in front of or beside parts, never behind.
- **9:16:** every figure uses the full-frame standard in section 2 (shared layout: `src/iso/reel.css` and `src/iso/react/reel.tsx`). Keep the top 15% and bottom 20% free of important content (Instagram UI). Labels and tables must stay readable at phone size, so prefer larger parts over many parts.
- **Readouts:** small neutral corner elements in the style of the NAND truth table (truth table, graph, counter, stored-bit display). Rust only on the current or active item. A dimmed row or item means "not yet" or "not applicable". Column headers line up with their values.
- **Captions and text:** none by default. The voiceover and my hand drawing explain; figures show motion. Keep only part and pin labels and at most one small state tag. Add a caption only if I ask (then: at most 8 words, sentence case, about 0.3 s after its event).
- **Engraving in every figure HTML, board only:** every figure carries exactly one `ROLLIN-रोलिन-ROLLIN-रोलिन` engraving, on the board's front face (kit label style, small, mid tone). No second engraving on readouts or parts. Analogy objects may also carry ROLLIN where the object would naturally show a name (in-story branding, not a stamp): the caller ID on a dialled phone, a maker's plate on a tap or tank, a runner's bib, a brand on a washing machine or thermostat, the label on a parcel in a bucket-brigade scene. One such spot per figure at most, in sepia ink, never over an annotation space. Scenes without a board (an analogy with only tanks, pipes, a seesaw, runners and so on) put it on the largest grounded part's front face (tank plinth, pipe base, seesaw stand, track kerb). Never skip it.
- One idea per figure. Fewest parts that read clearly. If a figure needs more than about 8 parts or 3 simultaneous readouts, it is too busy: say so. **Chip-design (set 2026-11-02, from the ep 4 analysis):** the analogy object has at most 3 moving parts plus 1 callout plate, and the circuit shows 1 readout at a time (2 at most); ep 4 (one clock, then 4 bit boxes, 1 gear block, 1 table) beat 18 (about 10 analogy parts, then 2 graphs and an energy panel).

## 6. Timing and loop conventions

- State the time unit at the top of each figure's model (for example "one gate delay = 2 s"). Use slow motion for anything about delay or races so the viewer can follow it.
- Cascaded gates stagger by one unit (about 1 s unless the figure sets another). Never update a gate and the gate it feeds on the same frame.
- Hold every important state for at least 2 s. Hold the key state (the one that answers the question) about twice as long.
- Loops are 10-30 s and end in the starting state so the reel loops cleanly. The last frame should visually match the first.
- Every board plays the shared entrance once (lands at 1.35 s, loop starts at 3 s; `rules/build.md`).
- **Compute every signal from a model; never hand-script lamp or wire states.** Simulate once in `model.ts` and drive lamps, wires, tanks, graphs and readouts from the same numbers so they stay in sync.
  - Gate logic: each gate output is its function of its inputs one delay earlier (transport delay). Glitches then appear on their own.
  - Races and latches: an output changes only if its new value holds for the whole delay (inertial delay), so the faster gate wins.
  - CMOS: tank level follows an RC curve 1 - e^(-t/τ) on rise and e^(-t/τ) on fall, with τ proportional to 1 / effective width.
- Timeline in each model: times of lever moves, part arrivals and caption changes; everything else is computed.

## 7. Logic and physics that must be correct (check against these, do not "simplify" them wrongly)

- NAND: Y = NOT(A AND B). 00 -> 1, 01 -> 1, 10 -> 1, 11 -> 0.
- Universal gate: NOT = NAND with both inputs tied; AND = NAND followed by a tied-input NAND; OR = each input through a tied-input NAND, then both into one NAND.
- CMOS inverter: PMOS conducts when the input is 0 (small bubble at its control pin), NMOS conducts when the input is 1, never both at once in steady state. Use break-before-make: the open valve closes before the other opens. Idle current is only leakage; current is drawn from VDD mainly while charging the load. Draining the load goes to GND, so a meter on VDD shows only a tiny crossover blip then.
- CMOS NAND2: PMOS in parallel (pull-up), NMOS in series (pull-down). CMOS NOR2: PMOS in series, NMOS in parallel.
- Equal-drive sizing (assuming Wp = 2 x Wn for the reference inverter): NAND2 PMOS w=2 each, NMOS w=2 each, total 8. NOR2 PMOS w=4 each, NMOS w=1 each, total 10. Both gates then fill the same load at the same rate, and NOR costs about 25% more width. Block width equals transistor width in the figure.
- Equal-speed comparisons must use each gate's worst case. NAND2's worst-case rise has one PMOS on (A falls, B stays 1). With both inputs at 0, NAND2 charges twice as fast.
- With equal widths (all w=2, the current NAND vs NOR figure), NOR2's rise is half as fast as NAND2's, and its fall is faster.
- Gate delay is roughly 0.69 x R x C (R = drive resistance, C = load). Doubling transistor width halves R, so the same load charges about twice as fast (t50% halves), but the wider input loads the previous stage.
- Glitch: Y = A·B + A'·C with B=1 and C=1. When A falls 1 -> 0, the top path (AND, OR: 2 gates) changes at t=2 and the bottom path (inverter, AND, OR: 3 gates) reaches the OR at t=3, so Y dips to 0 for one unit (t=2 to t=3). The redundant term B·C holds Y at 1.
- NAND SR latch: inputs S̄ and R̄ are active low. Top NAND takes S̄ and Q̄ and outputs Q; bottom NAND takes R̄ and Q and outputs Q̄. 1 1 holds; 0 1 sets Q=1; 1 0 resets Q=0; 0 0 forces Q and Q̄ both to 1 (invalid). Releasing both from 0 0 at once is a race: the faster gate wins, so the result is unpredictable.
- Only the invalid-state figure may show both latch outputs lit at once. Q and Q̄ are opposites in every other state. The stored-bit display shows "?" (grey) while both are 1.

## 8. Build and code

- No interaction, no WebGL.
- Each figure is its own folder in `src/figures/<slug>/` on the shared kit (`src/iso/`), with `model.ts`, `geometry.ts`, `art.tsx`, `live.tsx`, `figure.tsx`, its CSS, a `main-<slug>.tsx` entry and a `builds/build-<slug>.mjs` script (`npm run build:<slug>`). Code layout, kit quirks, capture and output paths: `rules/build.md`.
- **Check frames shown to me:** render from a copy in C:/TEMP/check/ WITHOUT `--transparent` (`--scale 0.5 --fps 30 --seconds N --force`), so the sepia paper shows; an alpha PNG looks white in viewers. Only the final .mov export uses `--transparent`.
- Existing figures include: NAND gate, CMOS inverter, inverter to NAND2, NAND vs NOR, CMOS idle power, wider is faster, glitch (hazard), SR latch (with stored-bit display), SR latch invalid state. They must keep looking and looping exactly as they do now.
- Done means: the build passes and the preview page shows the figure looping. Nothing more.
- **Scripts:** voiceover scripts, drawing cues, hooks and series bookkeeping follow `SCRIPTS.md`; read it before any script work. Write one with `/script video N <series>` (`.claude/skills/script/`); brief, checkers (`python script-writer/check-voice.py`, `check-page.py`) and the page layout example are in `script-writer/`. Notion is the source of truth; `series/*.csv` and `scripts/` are backups.

## 9. Series context (for naming and captions)

- Track: digital electronics, numbered reels, each answering one interview question and building on the previous one (NAND, CMOS inverter, CMOS NAND, NAND vs NOR, CMOS power, gate delay, glitch, SR latch, SR invalid state, D latch, and so on).
- Figure file and figure names use a short lowercase slug (for example sr-latch, sr-latch-invalid). Keep titles and captions plain English; the voiceover is separate.
- On-screen text should explain, not repeat the voiceover: the question, the key state, and the one-line takeaway.

## 10. Rebuilding from scratch

The rebuild guide (setup, build script, kit numbers, figure catalogue of episodes 01-14) is in `REBUILD.md`. Read it only when `src/` is missing or an old figure must be rebuilt from its built page. New figures: `/new-figure`; checks: the `figure-checker` agent.

## 11. Notes overlay, reel export and the build database

Finished reels are made in `builds/notes/` (cue files, transcripts, `notes:check`, `notes:export`, `series/reel-builds.csv`). Read `rules/notes.md` and then `builds/notes/README.md` before any notes, subtitle, engraving or MP4 work; never rebuild that pipeline from scratch, and never work around `notes:check`.
