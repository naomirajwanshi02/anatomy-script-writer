# Taps world kit

The water rig and the DE 08-style CMOS inverter that chip-design episodes 18 onward share (episode 18, short-circuit
power, is the reference: `src/figures/short-circuit-taps/`). One board, square for the water rig and long for the
circuit, folds between the two scenes: high tank with the ROLLIN maker's plate -> VDD rail, floor grate -> GND, fill tap
-> PMOS (blue), drain tap -> NMOS (red), handle -> input lever, glass tank -> output tank "load C" with the lamp. The
water meter (needle + two cup drums) folds into the readout. Episode 16 (`switching-threshold-taps`) predates the kit and
keeps its own files.

| File | What it holds |
|---|---|
| `geometry.ts` | `makeTapsWorld(layout)`: every part's paths; `TAPS_LAYOUT` holds the default positions and sizes (episode 18's). |
| `model.ts` | Helpers for an episode's model: `inverter()` (square-law through-current, tap openings), `handleTrack(MOVES)`, `replayClock` (slow-motion replay), `foldClock`, `simulate` (tank level RC-like + energy), `ramp`/`bump`/`window01`, and the `TapsState` the loop paints. |
| `graph.ts` | `makeGraph(windows, iPeak, hAt, current)`: the two-row readout graph (Vin, I from VDD). |
| `config.ts` | `TapsConfig`: parts on/off, labels, readout, `stateAt`, loop. |
| `art.tsx`, `live.tsx`, `figure.tsx`, `taps.css` | The static art, the one loop and the reel frame (`TapsFigure`). Class prefix `tw-`. |

## Start an episode from the kit

1. Make `src/figures/<slug>/` with three files, copied from `short-circuit-taps/`:
   - `model.ts`: the time unit, `LOOP`/`END`, the device numbers (`inverter({ vtn, vtp, k })`), the `MOVES` timeline,
     folds (`FOLD`, `BACK`), the `simulate(...)` call, and `stateAt(t)` returning a `TapsState`. Beats you do not use
     (rings, flashes, glows) are left out (they default to 0). Everything shown is computed from this one model.
   - `config.ts`: `makeTapsWorld({ ... })` (override only the layout numbers that change), `parts` (`meter`, `grate`,
     `tags`, `glint`, `slowmo`, `drip`, `ghost`), `labels`, `readout` (`graph` and/or `counter`, `below` for its top),
     `reducedAt` (the key state) and the stage `label`.
   - `figure.tsx`: `<TapsFigure cfg={CONFIG} />`.
2. Add `src/main-<slug>.tsx` and `builds/build-<slug>.mjs` (copy episode 18's, change the paths) and the npm script.
3. Build and look at frames from a copy in `C:/TEMP/check/` (CLAUDE.md section 8).

When only config, timeline and model change, no two-panel sample is needed (the look is the reference's). A part the
world lacks (a new readout, a new object on the board) goes into the kit behind a `parts` flag, off by default, so older
episodes do not change; say so to the owner.
