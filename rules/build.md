# Building and rendering figures

Moved out of CLAUDE.md (sections 2, 6 and 8) so it loads only when a figure is built, rendered or checked. Everything in CLAUDE.md still applies.

## Backdrop (was section 2)

- Backdrop (separate video, `shorts/backdrops/Grid backdrop 2min (sepia).html`): paper #efe3c8 with brown #3b2a1a dots, minor at 12 % (16 px grid), major and animated dots at 18 % (96 px, offset -40 px), and a soft warm vignette at the edges. Render it without `--transparent` and place it under the figure in Premiere. Figures render with `--transparent`, so their own paper drops out.

## Entrance (was section 6)

- **Entrance (every board, plays once):** the board rises from below while its parts (gates, levers, lamps, displays) fall onto it under gravity, landing at 1.35 s with sparks at the contact points and a short damped shake; readouts slide in by 2.3 s; the figure's own loop starts at 3 s (shared code: `src/iso/entrance.ts`). The episode badge uses its own power-on boot instead, so the two never look alike.

## Code (was section 8)

- React components: geometry in plain .ts modules, static art in a server component, one "use client" component for the loop.
- Each figure is its own folder on top of the shared Anatomy kit (`src/iso/iso-kit.ts`, `src/iso/react/draw.tsx`, `src/iso/react/live.tsx`, `src/iso/iso.css`):
  - `model.ts`: time unit, timeline, the simulation, captions, readout rows.
  - `geometry.ts`: board, parts and wire paths.
  - `art.tsx`: server component with every static part.
  - `live.tsx`: the one "use client" loop; it writes states into the static art.
  - `figure.tsx`: the card.
  - A figure-scoped CSS file with the style tokens.
  - A `main-*.tsx` entry and a `build-*.mjs` script per figure produce one self-contained HTML preview.
  - Taps-world figures (water rig + CMOS inverter) are only `model.ts`, `config.ts` and `figure.tsx` on the taps kit (`src/iso/taps/README.md`).
- **Kit quirks:**
  - The kit's shaded faces (`.iso-shade[data-shade]`) and engraved-text tone colours override figure CSS, so figure overrides of fills need `!important`.
  - A plate corner (hint or readout) is only rendered if it has content. Pass a non-breaking space when the loop fills it in later.
  - The plate's `fig` prop accepts a string only; put a live counter in its own overlay element.
  - Parts that move or resize (sliding blocks, growing valves, tank fluid) are rebuilt with the kit's `solidSvg` into a slot element.
- **Testing notes, if I ask for a check:**
  - Headless screenshots can show ghosted duplicate patches; force a repaint before capturing.
  - CSS transitions can appear mid-fade when the test clock jumps ahead; that is not a bug in the figure.

## Output and rendering (was section 8)

- **Output and rendering:** builds write to `shorts/<series>/<NN> <interview question>/<interview question>.html`, one series folder (`digital-electronics`, `verilog`, `chip-design` for `series/book-concepts.csv`) and one numbered folder per video (NN = the episode number in that series' CSV); an analogy version sits in the same folder as `<interview question> (<analogy>).html` (overlays in `shorts/overlays`, backdrops in `shorts/backdrops`). Videos are rendered frame by frame with `builds/capture.mjs` (standalone: Node 22+, Chrome, ffmpeg): `node builds/capture.mjs "shorts" --transparent` walks every subfolder and writes a ProRes 4444 .mov next to each .html (alpha with `--transparent`; `--qtrle` for the old QuickTime Animation codec), skipping ones already up to date (`--force` redoes them). It writes `<name>.partial.mov` and renames it when done. Script defaults are `--scale 2` (2160x3840) and 60 fps, but render figures with `--transparent --scale 1 --fps 30`, and backdrops with `--scale 1 --fps 30` without `--transparent`. Length = 3 s entrance + one loop, read from the page's `<meta name="iso-loop">` (written by `builds/build-figure.mjs` from the figure's `LOOP`); `--seconds` overrides. Pages must keep the capture hook (they get it from the kit's `useFrameLoop`).
- **Project layout:** `src/` (figures in `src/figures/<slug>/`, shared kit in `src/iso/`, analogy water kit in `src/iso/analogy/`, taps-world kit in `src/iso/taps/`, `main-<slug>.tsx` entries), `builds/` (one `build-<slug>.mjs` per figure, plus `build-figure.mjs` and `capture.mjs`; each has an `npm run build:<slug>` script), `shorts/` (built pages and videos), `series/` (episode lists `digital-electronics.csv` and `verilog.csv`, imported into Notion). Analogy figures (water, seesaw, runners) start with the analogy and fold into the original circuit; see `src/figures/latch-race-through-locks/` as the reference.
- **Sepia in the built pages:** pages built before the sepia switch carry the theme as override blocks right after their first `</style>`: `<style id="sepia">` (colour map), `<style id="bulb">` (glass bulbs), plus `sepia-bulb` and `levers` where needed. Deleting a block restores that part exactly. Source figures get the same look from their own CSS tokens, the kit defaults in `src/iso/iso.css` and the kit bulb (`src/iso/react/bulb.tsx`: `bulbParts`, `Bulb`, `BulbGlowDef`; styles in `src/iso/bulb.css`). Use the kit bulb for every new lamp.
