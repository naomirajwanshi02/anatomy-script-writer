# Lamps, levers and wires

Moved out of CLAUDE.md (sections 3, 4 and 5) so it loads only when a figure is built or checked. Everything in CLAUDE.md still applies.

## Lamps (was section 3)

- **Dashboard and device warning lights** (car instrument clusters, panel indicators) are lamps too: while lit they may glow yellow #ffc21a, red #c2402f or blue #2f6fb8, each with a soft halo in its own colour, and are dark sepia glass when off. Never green (too close to my olive pen). They are small icon lamps, not glass bulbs.
- Yellow is only for lit lamps. Every lamp is a glass bulb (screw socket with threads, glass globe, zig-zag filament, shine line), as in episodes 01-14:
  - Off: clear glass (#fffaf0 at 20 %), brown filament, no glow at all.
  - On: yellow #ffc21a glass, near-white filament #fffdf2, a yellow halo (#ffb400 drop shadow) and a soft pool of light on the board (radial glow 1.5x the lamp glow size, pale core #fff6c8 at 55 %, #ffc21a at 18 %, normal blending, never screen).
  - Brightness follows the figure's `--lamp` value (0 to 1), so a dimmed lamp glows less.
- **Appliance interior lights** (fridge, oven, washing-machine drum) are realistic white LED strips, not glass bulbs: lit they are near-white #fffdf2 with a white halo, they wash the inside with white light, and a clearly visible white glow pool (core #fffdf2 about 70 %, normal blending) spills onto the board. No yellow on them. This is the one exception to every lamp being a glass bulb.
- Lamps (was section 5): glass bulbs (above), clear when off, yellow with a halo and a light pool on the board when lit. Inputs that change are levers, never LEDs. Levers: pulled-down knob means logic 0 for active-low inputs, as in the existing figures.
- Use the kit bulb for every new lamp (`src/iso/react/bulb.tsx`: `bulbParts`, `Bulb`, `BulbGlowDef`; styles in `src/iso/bulb.css`).

## Wires and signals (was section 4)

- **Gate-level figures** (logic, latches, timing):
  - Every wire has a thin neutral base trace (lo) that is always visible.
  - On top of it sits a separate dotted flow overlay: class gate-flow, data-flow attribute, stroke-dasharray "2 6", animation iso-flow 1.6s linear infinite, with dashes running in the signal direction from input to output.
  - The overlay is rust #b5541c, shown only while the wire carries a 1 and hidden (display none) while it carries a 0.
  - No solid rust lines.
- **Transistor-level (CMOS) figures:** a strap carrying current turns solid rust (about 2.4 px), with lighter #f0a868 dashes running in the current direction on top. Its brightness follows the current, so it fades as a tank fills. Straps carrying no current stay neutral sepia. This is the one exception to "no solid rust lines".
- Keep the prefers-reduced-motion rule that stops the animation.
- Feedback or crossing wires are drawn as raised wires that clearly pass over each other, at different heights, with the base trace in mid (slightly brighter) so the loop can be followed.
- Gate input pins carry tiny labels only where it helps and the board is not crowded.
- **Every wire and its path stay visible (set 2026-10-28):** each wire must be followable end to end at phone size: never hidden under or behind tiles, chips, gates or lamps, never squeezed against the board's back edge or its inset line, and parallel wires at least about 5 board units (about 25 frame px) apart. Route wires in open board space in straight rows; if there is no room, make the board bigger (deeper or wider) rather than shrinking the gap or hiding a run. The same goes for the gate, lamp and markers a wire connects: their symbols must read at phone size. Check it on a frame before calling the figure done.
