# Episode 18 figure spec: short-circuit-taps

Slug `short-circuit-taps`, copied from the approved sample `src/figures/short-circuit-taps-sample/` (reference `switching-threshold-taps`). Output `shorts/chip-design/18 What is short-circuit power in CMOS/What is short-circuit power in CMOS (taps, voice).html`. Built straight on the recording (take 04_27_08): figure time = voice time = video time. LOOP 71.5 s, video 74.5 s (voice ends 70.1 s, end card from 70.5 s). Time unit: seconds of the recording.

## Parts
- Analogy (square board): high tank on a stand with the ROLLIN maker's plate; water meter (needle and two-drum Merriweather cup counter) on the fill pipe; top (fill) tap; glass tank; bottom (drain) tap; drain grate at the front edge; handle (made larger, with an engraved middle mark on its arc) linked by a rod to both tap wheels. Colour pop: blue water.
- Circuit (DE 08 board): VDD rail "VDD 1 V" at the back, GND at the front, input lever with a Vin engraving, blue PMOS and red NMOS valve blocks (large gate bars), glass output tank, glass-bulb output lamp. One PMOS and one NMOS label.
- Readouts (circuit only, below the board, Oxanium tabular-nums): a Vin row (0-1 V, pale 0.3-0.7 V "both on" strip that lights rust while the ramp crosses it), an "I from VDD (mA)" row, and the "energy lost" counter. Pulses are drawn live from the model, areas shaded rust (active) or faded rust (the old pulse).
- ROLLIN engraving on the board's front face (Oxanium 500); the in-story spot is the maker's plate.

## Model (model.ts, one simulation drives both halves)
VDD 1 V, Vtn = |Vtp| = 0.3 V. Handle position h = Vin (0 to 1). Top tap opening = PMOS on while Vin < 0.7; bottom tap opening = NMOS on while Vin > 0.3. Through-current I = k min((Vin-0.3)^2, (0.7-Vin)^2) for 0.3 < Vin < 0.7, else 0. Energy (and cups) = integral of VDD x I dt, scaled so a 0.5 s edge = 1 and a 5 s edge = 10 (exactly 10x, 0.2 s vs 2.0 s overlap). Water stream, rust straps, needle, cup counter, graph pulses and energy counter all read these numbers. Tank level: fills through the top tap, drains through the bottom, RC-like.

## Timeline (video s, from 18.words.json)
- 0-3 entrance (board lands, parts fall). Hook state from the start: handle at the middle mark, both taps half open, blue stream through the tank into the grate, needle turning, counter 04.
- 4.2 "slow handle": handle pulses. 6.6-7.3 "Let's watch": handle to the fill end, tank refills, counter zeroes (00).
- 8.3 "two taps": rod glows rust for 2 s. 9.4-11.2 "As one opens": slow sweep to the drain end and back; both taps run briefly as the handle crosses the middle mark.
- 11.8 top tap pulses; 12.7 tank glints; 13.8 bottom tap and grate pulse; 15.5 meter pulses (needle 0, counter 00).
- 17.5-18.0 "Flick": handle fill to drain in 0.5 s; tank drains. 18.1-19.9 slow-motion replay (4x, small "slow-mo" tag); counter 00 to 01 at 19.2 ("one cup"). 20.0-20.6 reset (fill end, tank full, counter 00).
- 21.0-26.0 slow 5 s turn; both open 22.5-24.5 (through-stream glows 24.4); counter 00 to 10 by 24.5; 26.0 "10 cups": the 10 pulses.
- 26.8-33.6: handle back to the middle mark, through-stream running (start-frame state); 29.0 "slips through": grate stream pulses.
- 33.7-35.3 fold, one part at a time 0.3 s apart with its new label flashing: high tank to VDD rail, grate to GND rail, taps to PMOS/NMOS, handle to lever, glass tank to output tank (blue turns rust), meter to the readouts; lamp appears. Lever at 0, tank full, lamp lit.
- 35.6 lever pulses, Vin row appears; 37.3 output tank pulses; 39.8 PMOS gate flashes; 40.4 VDD rail pulses; 41.4 NMOS gate flashes; 41.9 GND rail pulses.
- 42.8-47.8 lever ramps 0 to 1 V (5 s); NMOS lights at Vin 0.3 (44.3), PMOS fades at 0.7 (46.3); strip lit 44.3-46.3; rust strap VDD-PMOS-NMOS-GND while both on; tank drains, lamp out.
- 47.8 lever back to 0.5 V and holds to 52.4: both on, tank half full; 49.4 "Current runs": rust dashes VDD to GND, I row at a steady level; 51.9 "short circuit": tank level still, dashes running.
- 52.5 lever to 0, tank refills, graph clears, counter 0. 53.3 Vin row pulses. 54.4 "flick": ghost water handle flicks beside the lever, held 2 s. 55.7-56.2 sharp edge 0 to 1 V: narrow pulse, counter 1.
- 56.6 lever to 0 (narrow pulse stays, faded). 57.2-62.2 slow edge (5 s); 58.8 ghost slow-turning handle, held 2 s; both on 58.7-60.7; wide pulse, same height, 10x wide, area shading as it grows; counter climbs to 10 at 60.7.
- Key state 58.7-64.4 (5.7 s, the longest hold): both pulses and "1" and "10" side by side; 62.0 narrow pulse brightens; 63.5 "tiny": narrow pulse pulses.
- 64.4-66.0 fold back to the water start frame (handle middle, through-stream, needle turning, counter 04); 66.1 "shut tap": one drop falls from the bottom tap's spout. Hold to 74.5.

## Rust and lamps
Rust only on the conducting straps and dashes, the lit both-on strip, the active pulse area and the active counter value. Output lamp lit while the output tank is high (dims with the level). No other lamps.

## Rules checked in model.ts
Break-before-make does not hold during a slow edge: NMOS turns on (0.3 V) before PMOS turns off (0.7 V); overlap time = 0.4 x edge time; energy ratio 10.0 for 0.5 s vs 5 s edges.
