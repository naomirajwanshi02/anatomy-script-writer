# Episode 15 figure spec: tri-state buffer (shared tank)

Series: chip-design. Episode 15. Slug: `tristate-tank`.
Folder: `shorts/chip-design/15 What is a tri-state buffer and why does a bus need it/`
Output page: `What is a tri-state buffer and why does a bus need it (tank, voice).html`
Build: `builds/build-tristate-tank.mjs`, entry `src/main-tristate-tank.tsx`, npm script `build:tristate-tank`.
Reference figure to copy the structure from: `src/figures/decoder-intercom/` (episode 13, voice-timed: video t = audio t).
Water look: the water kit in `src/iso/analogy/` and `src/figures/cmos-inverter-taps/` (taps, tanks, blue water #2f6fb8).
Source of the story: the Notion page table (copied in `scripts/15 What is a tri-state buffer and why does a bus need it.md`). Follow CLAUDE.md sections 2-8 fully.

## Timing

Video t = audio t. Voice ends 68.42 s. LOOP = 68 (video 71 s). Entrance 0-3 s as the kit does (board rises, parts fall, land 1.35 s).
Word times (s), from `builds/notes/episodes/chip-design/15.words.json`; 53.3-57.2 was not transcribed and is timed by hand from the pauses:

- FIGHT 0.92, tank 1.82, One fills 2.56, one drains 3.34, Which tap wins 4.30, Let's watch 5.40
- Three tap pairs 6.52, this tank 7.40, fill tap 8.80, drain tap 9.56, gauge 10.34
- Pair one fills 11.12, pair two drains 12.12, Neither wins 13.56, Water rushes 14.54, level sticks 15.86, in between 16.38
- lock 18.42, both taps 18.80, Pairs two and three lock 19.92 (lock 20.82), Pair one fills alone 21.54 (fills 21.92)
- One pair works 22.92, the rest only read 24.18 (read 24.82), episode 15 26.46
- Fold: "Now" 28.00, "bits" 29.68. Fold runs 28.0-29.8.
- The tank 30.38, shared wire 31.24, bus 32.30, Full is a one 32.92, empty a zero 34.10 (zero 34.66)
- Each pair becomes a chip 35.30 (chip 36.22), One switch pushes 36.70 (pushes 37.18), another pulls 38.14
- Chip one pushes 39.58, chip two pulls 40.56, Current rushes 41.96, The bus sits 43.34, in between 43.96
- Each lock 44.80, called enable 46.20, Off 47.34, both switches 47.88, turn off 48.28, The chip disconnects 49.08 (disconnects 49.40)
- So a chip has three states 50.36 (three states 51.16), One 52.34, zero 52.76, or 53.34, DISCONNECTED 53.50
- Chips two and three 54.28, disconnect 55.30, and read 56.01, chip one's 56.45, clean one 57.26
- That's a tri-state buffer 57.78 (tri 58.24), pushes 60.08, pulls 60.64, or disconnects 61.20
- Fold back: "Here" 62.14; fold back 62.14-63.6, then the start frame holds to 71 s (taps 64.80, That's episode 16 67.32).

## Analogy scene (0-28 s): square board

- One tall glass tank in the centre, blue water #2f6fb8 (the opening colour pop), maker's plate "ROLLIN" on its plinth (the one in-story ROLLIN). The board front face carries the `ROLLIN-रोलिन-ROLLIN-रोलिन` engraving (kit label style).
- A raised supply pipe along the back fed from a small high supply tank on legs (back left); a drain gutter along the front edge.
- Three tap pairs in a row beside the tank (pairs 1, 2, 3, engraved): each a fill tap on a riser from the supply pipe into the tank, and a drain tap from the tank bottom to the gutter. Fill pipes drawn wider than drain pipes (equal flow). Each pair has a lock lever (levers only for changing inputs) and a small round level gauge with a needle in front. Keep every pipe and its path visible (no runs hidden behind the tank; place pairs in front or beside, never behind, at azimuth 62).
- Readouts below the board (Oxanium, tabular nums): a 3-row table (pair | lock | tap: fill / drain / shut; active value rust, shut in lo ink) and a tall level meter (full, half, empty marks) with the level value.
- Start frame (0 s and the loop end): pair 1 fill open, pair 2 drain open, pair 3 shut, level at half, blue flow streaks from supply through tank to gutter, red dashed warning outline (stroke 4.5, dash 10 6) round the tank.
- 0.92: both streams surge once. 5.40: both taps close, outline fades, level holds at half.
- 6.52: pairs 1-3 lift and settle in turn. 7.40 tank glints. 8.80 fill taps pulse. 9.56 drain taps pulse. 10.34 gauges pulse (all read half).
- 11.12: pair 1 fill opens, level starts to rise, row 1 "fill" rust. 12.12: pair 2 drain opens, row 2 "drain" rust. 13.56: level settles at half (computed). 14.54: fast blue flow streaks, warning outline in. 16.38: meter needle at half, all gauges half. Hold to 17.3.
- 18.42: the three lock levers pulse. 19.92: levers 2 and 3 drop to locked; pair 2 drain shuts; rows 2 and 3 "shut" lo ink; rush stops; outline fades. 21.54: level rises from half to full (RC fill curve); gauges follow; row 1 stays rust.
- 22.92 pair 1 pulses; 24.48 gauges 2 and 3 pulse. Hold full to the fold.

## Fold (28.0-29.8): board becomes long

The tank flattens into one horizontal bus wire across the board with a bus meter at its right end (or below the board as the readout). Supply pipe becomes the VDD rail at the back (dark #4a3726 tint, engraved VDD at its left end); the gutter becomes the GND rail at the front (light #a08a68 tint, engraved GND). Each tap pair becomes a chip block between the rails: PMOS block (blue #2f6fb8 light tint body, w=2, wider) from VDD down to the chip's output pin on the bus; NMOS block (red #c2402f light tint body, w=1) from the pin to GND. One PMOS label and one NMOS label, beside chip 1 only. No control pins on the transistor blocks. Each lock lever becomes an enable lever (EN1, EN2, EN3) in front of its chip. Each chip gets a flat printed data label: chip 1 D=1, chip 2 D=0, chip 3 D=1. Table headers become chip | EN | out (1, 0, Z). Fold ends with EN1 on, EN2 and EN3 off; bus = 1.

## Circuit (29.8-62.1 s)

- 30.38: ghost of the tank fades over the bus. 31.24: bus flashes along its length. 32.30: bus pulses. 32.92: bus meter reads full, value "1". 34.10: EN1 off, EN2 on: bus meter to empty, "0"; table updates. Hold to 36.2.
- 36.22: EN2 off, EN1 on; bus back to "1"; chip 1 block pulses. 36.70: chip 1 PMOS gate bar lit full blue; solid rust strap VDD -> PMOS -> bus (charging strap, CLAUDE section 4 CMOS strap rule; it fades as the bus fills). 38.14: chip 2 NMOS block pulses (still off).
- 39.58: chip 1 pulses. 40.56: EN2 flips on; chip 2 NMOS gate bar lit full red. 41.96: one solid rust strap VDD, chip 1 PMOS, bus, chip 2 NMOS, GND, light rust #f0a868 dashes running toward GND; red dashed warning outline round the strap path. 43.96: bus meter at half, value "?" in lo ink.
- 44.80: ghost lock over each EN lever. 46.20: the three EN wires flash lever to chip. 47.88: EN2 flips off; chip 2 PMOS and NMOS gate bars both faint. 49.40: chip 2's output pin lifts a hair off the bus; strap through chip 2 neutral; outline fades; bus meter climbs to full "1".
- Key state 49.4-61.2 (the longest hold). 51.16: over chip 2 three small tags flash in turn, about 0.45 s each, with their switches: "1" (PMOS lit), "0" (NMOS lit), "Z" (both faint): 51.16 "1", 52.34 "1"->"0" swap timing so "1" shows on "One" 52.34, "0" on "zero" 52.76, "Z" on "DISCONNECTED" 53.50 and stays. Table row 2 out = Z.
- 54.28: chips 2 and 3 pulse; both Z. 55.30: pins sit lifted, gate bars faint. 57.26: small read ticks run from the bus into chips 2 and 3; bus meter "1" pulses; only chip 1's path is rust.
- 58.24: chip 1's PMOS, NMOS and EN glow together. 60.08 chip 1 PMOS pulses. 60.64 its NMOS pulses. 61.20 its pin lifts and drops back.

## Fold back (62.14-63.6)

Reverse fold to the tank; the state returns to the start frame (pair 1 fill and pair 2 drain open, pair 3 shut, level half, flow streaks, red dashed outline). Held to 71 s so the last frame matches the first.

## Model (computed, never hand-set)

Timeline holds only lever/tap moves, folds and highlight beats. Computed:
- Each driver: out = D if EN = 1 else Z (analogy: tap open per pair state, lock = both shut).
- Bus/tank level target = push / (push + pull) over enabled drivers (equal drive: each counts 1); when none is enabled the level holds. Level follows an RC curve toward the target (tau about 0.35 s in the circuit, about 1 s in the analogy fill).
- Rush current = push x pull / (push + pull): drives the flow streaks / rust strap brightness and the warning outline.
- Bus value: "1" above 0.9, "0" below 0.1, otherwise "?".
- Strap rule: a strap carrying current is solid rust with light rust dashes in the current direction; brightness follows the current (charging strap fades as the bus fills).

## Layout

Full 9:16 frame on paper, board about 95% of frame width, readouts below the board, top 15% and bottom 20% clear, label sizes readable at phone size, parallel wires/pipes at least about 25 frame px apart, nothing hidden behind tall parts. Fonts per CLAUDE.md chip-design rules (Type Machine for plates and engraved part tags, Oxanium for readouts, Oxanium 500 for the board ROLLIN engraving). Sepia palette only; olive never used.

Done = build passes and the page loops. Report the board front-face geometry if easy (for the notes engraving: engraving is already in the figure, so notes use `engrave: null`).
