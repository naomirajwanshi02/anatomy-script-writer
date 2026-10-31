# What if every car copied the wobble ahead?

**Properties:** # 11 · Interview question: What is the regenerative property of logic gates? · Concept: Regeneration: each gate's steep transfer curve pushes a weak level back to a clean 0 or 1 · Analogy: A convoy of five numbered supercars. First the copying world: a dog runs out, car 1 wobbles, each car copies and adds, so car 5 crosses the line. Then real drivers: they copy the lane change but steer by the lane lines, so car 5 drives straight. Car = gate, lane = bit (1 near 1 V, 0 near 0 V), the middle line = the switching point where the gate is steep; inside a lane it is flat, and it builds its output from its own power wire · Book: Rabaey (Digital Integrated Circuits 2e) · Status: Script · Hook title: What if every car copied the wobble ahead?

## 1. Detailed script

The complete explanation, written for a curious 15-year-old. The voice, the drawing and the figure are all cut from this. Marks: **V** = voice, **D** = drawn note, **F** = figure motion.

| # | Step | Full explanation | Marks |
| --- | --- | --- | --- |
| 1 | Hook (what if) | What if every car in a line copied the wobble of the car ahead? The figure answers at once with a ghost convoy: a dog runs out, car 1 wobbles, and each car behind copies the swing and adds its own, so the wobble grows car by car until car 5 crosses the middle line. The dog gives the wobble its cause. Opening on the copying world makes the real question possible: a viewer would never expect car 2 to wobble, but after seeing copying spread it, not spreading becomes the surprise. | V, D ("copying: wobble grows"), F (ghost convoy; red dashed warning outline on car 5 across the line) |
| 2 | Question | "Real drivers stop that. How?" Turns the what-if into the reel's question, in the hook's own words. | V, F (ghost convoy fades; the real convoy drives) |
| 3 | Follow the lane | Car one changes lane and every car behind follows it into the new lane: drivers do copy where the car ahead goes. | V, F |
| 4 | Not the wobble | The dog runs out again and car one wobbles, but no driver copies it: each steers by the lane lines, so a wobble ahead doesn't move the car behind. | V, F |
| 5 | Result | Car five drives dead straight. | V, D ("car 1 wobbles → car 5 straight"), F |
| 6 | Takeaway 1 + series line | Follow the lane, not the wobble. | V |
| 7 | Fold | Each car becomes a gate in a chain; the lanes become the voltage bands of 0 and 1. | V, F |
| 8 | Lanes = bits | A 1 lives near 1 V, a 0 near 0 V (example numbers on a 1 V chip). | V, D ("lane = bit: 1 near 1 V, 0 near 0 V"), F |
| 9 | The line: steep | Around the middle line between the lanes (here 0.5 V) the gate is touchy: a tiny change in its input swings its output all the way (0.45 → 0.55 V in gives about 0.17 → 0.83 V out). That is how it picks a lane. | V, D ("middle line = 0.5 V: touchy"; "steep at the middle line"), F (the gate's curve) |
| 10 | Inside a lane: flat | Inside a lane the gate hardly reacts: 0.7 V or 0.9 V in both give a clean 1 out. | V, D ("0.7 or 0.9 in → clean out"), F |
| 11 | Own power | The gate makes its output from its own power wires (1 V and 0 V); the input only decides which one. So the input's wobble never travels through. | V, D ("power wires: 1 V and 0 V"), F |
| 12 | A bump | A bump drags a 1 down to 0.7 V; the next gate still sends out a clean 1. | V, D ("0.7 in → 1.0 out"), F |
| 13 | Gate after gate | Every gate wipes the bump away. If gates copied instead, five bumps of 0.08 V would drag 0.9 V down to 0.5 V. Limit: a bump so big it crosses the line comes out as the wrong bit; regeneration cleans small errors, not huge ones. | V, D ("copying instead: 0.9 → 0.5"; "past the middle line → wrong bit") |
| 14 | Takeaway | That's regeneration: every gate puts the bit back in its lane. | V, D (end card) |
| 15 | Teaser | Clean ones and zeros, every time. Can gates add them up? Episode 12 (full adder). | V, D ("Episode 12 →"), F (fold back to the road) |

### 15-year-old questions

| Question | Answered by |
| --- | --- |
| What if they copied? | Step 1: the wobble grows car by car until car 5 crosses the line (V, D, F ghost convoy) |
| How do real drivers stop it? | Steps 3-4: they copy the lane change, not the wobble; they steer by the lane lines (V, F) |
| How is a car like a gate? | Step 7-8: its lane is its bit (V, F) |
| What is "the middle line" for a bit? | Step 9: the voltage where the gate switches, here 0.5 V (D) |
| Why is the gate touchy there? | Step 9: its curve is steep there (V, F curve) |
| Why doesn't it react inside a lane? | Step 10: its curve is flat there (V, F) |
| Where does the clean 1 come from? | Step 11: its own power wire (V, D, F) |
| Does this fix every error? | Step 13: no, a bump past the line becomes the wrong bit (D) |
| Is "copying" real? | Step 13: a plain wire or a weak copy does pass errors on (D "copying instead") |

## 2. ElevenLabs script

```txt
[confident] What if every car copied the WOBBLE ahead?

A dog runs out. Car one wobbles, and each copy makes it bigger.

Real drivers stop that. How?

[warmly] Car one changes lane. Every car behind follows.

But no driver copies car one's wobble. Each driver steers by the lane lines.

So car five drives dead straight.

[thoughtful] Follow the lane, not the wobble. Let's understand this in episode eleven of chip design.

[pause] Now, the same with bits.

Each car is a gate. Its lane is the bit: one near one volt, zero near zero.

A gate is touchy only at the middle line, half a volt. There, a tiny nudge swings its output all the way.

Inside a lane, it hardly reacts. Seven tenths or nine tenths, it gives the same clean one.

It builds that one from its own power wire, not from its input.

Say a bump drags a one down to seven tenths. [slightly excited] The next gate still sends out a CLEAN one.

Gate after gate, every bump is wiped away.

[thoughtful] That's regeneration: every gate puts the bit back in its lane.

[curious] Clean ones and zeros, every time. Can gates add them up? That's episode twelve.
```

**ElevenLabs notes:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 196 words (at most 4 more), about 69 s planned at normal speed; voice speed about 1.05 for about 65 s. Numbers are said as "tenths"; keep them as written.

## 3. What to draw

**Drawing:** words in brown-black #2a1d10, arrows and underlines in olive #4f5d24, handwriting in Samble. Never more than 3 notes at once (counting the episode badge), at least 1.5 s between new notes, nothing ever overlaps (notes:check). Words in the open paper above or below the board; on the board only small pointers. Wipe the notes at each fold (the badge stays). Every note has an in and an out time and stays up at least 2.5 s; olive arrows, rings, wavy and straight strokes are pen marks, not notes. Times are planned (about 3 words per second); after recording, the main session syncs the figure and redoes them from the real word times.

| Step | Time | Voice | On screen (figure) | Draw (notes and pen marks) |
| --- | --- | --- | --- | --- |
| 1 | 0-7 s | "What if every car copied the WOBBLE ahead? A dog runs out. Car one wobbles, and each copy makes it bigger." | board lands: a two-lane road seen from above, five supercars numbered 1-5 in the upper lane, drawn as faint ghosts (the copying world). 2.9 ("A dog runs out"): the flat 2D dog trots across just in front of car 1. 4.0 ("Car one wobbles"): car 1 swerves side to side. 4.9 ("each copy"): cars 2, 3, 4, 5 copy the swerve one after another, each a little wider; 6.4 ("bigger"): car 5 crosses the middle line and a red dashed warning outline appears round it | In 4.9 s (on "each copy"), out 9.5 s: above, left, "copying: wobble grows" |
| 2 | 7-9 s | "Real drivers stop that. How?" | 7: the ghost convoy fades; the real convoy (solid cars, same colours and numbers) drives in the upper lane | Nothing new |
| 3 | 9-11.7 s | "Car one changes lane. Every car behind follows." | 9 ("Car one changes lane"): car 1 changes to the lower lane; 10.4 ("Every car behind follows"): cars 2, 3, 4, 5 follow it into the lower lane one after another, each settling in the middle | Nothing new |
| 4 | 11.7-16.4 s | "But no driver copies car one's wobble. Each driver steers by the lane lines." | 11.7 ("But no driver"): the dog trots across in front of car 1 again; 12.6 ("car one's wobble"): car 1 swerves twice, the swerve dying away; cars 2-5 stay straight. 15.6 ("lane lines"): the two lane lines of the lower lane brighten (one of them is the middle line between the two lanes) | At 15.6 s, on "lane lines" (pen mark): olive arrows from car 3 to both lane lines, stopping short |
| 5 | 16.4-19.8 s | "So car five drives dead straight." | 16.4: the convoy drives on; 17.4 ("car five"): car 5 pulses once, dead in the middle of its lane | In 17.4 s (on "car five"), out 22.6 s: above, right, "car 1 wobbles → car 5 straight" |
| 6 | 19.8-25 s | "Follow the lane, not the wobble. Let's understand this in episode eleven..." | the real convoy drives straight | In 23.04 s (on "episode eleven"), to the end: top right, "Episode 11" |
| 7 | 25-26.97 s | "Now, the same with bits." | fold: the road turns into one horizontal wire; the five cars become five small gate boxes in a chain along it (each a buffer: the bit goes out as it came in); a power rail (1 V) runs above the chain and a ground rail (0 V) below; above each gate's output a small upright 0-1 V gauge with two bands (the lanes, now upright) | Nothing new (notes wiped at 25 s) |
| 8 | 26.97-32.8 s | "Each car is a gate. Its lane is the bit: one near one volt, zero near zero." | 26.97 ("Each car is a gate"): the five gate boxes pulse left to right. 28.6 ("Its lane is the bit"): on every gauge the two bands draw in: the top band (0.75-1 V) labelled "1", the bottom band (0-0.25 V) labelled "0". 30.2 ("one near one volt"): the top bands pulse. 31.5 ("zero near zero"): the bottom bands pulse | In 28.6 s (on "Its lane"), out 35.4 s: above, left, "lane = bit: 1 near 1 V, 0 near 0 V" |
| 9 | 32.8-39.9 s | "A gate is touchy only at the middle line, half a volt. There, a tiny nudge swings its output all the way." | 32.8 ("A gate"): gate 2 highlights and its curve slides up beside it in free board space: input along the bottom (0-1 V), output up the side (0-1 V), an S-shape: flat, steep in the middle, flat. 35.4 ("half a volt"): a dashed line at 0.5 V on the input axis, and the steep middle of the curve outlines in rust. 36.35 ("a tiny nudge"): an input dot moves 0.45 → 0.55 V (a short hop). 37.6 ("swings its output"): the output dot jumps 0.17 → 0.83 V, a long rust arrow up the side; 38.6 ("all the way"): gate 2's gauge marker jumps from the 0 band to the 1 band | In 34.4 s (on "middle line"), out 39.9 s: above, right, "middle line = 0.5 V: touchy". In 37.6 s (on "swings its"), out 42.8 s: beside the curve, "steep at the middle line" |
| 10 | 39.9-45.8 s | "Inside a lane, it hardly reacts. Seven tenths or nine tenths, it gives the same clean one." | 39.9 ("Inside a lane"): the curve's flat top highlights. 41.9 ("Seven tenths"): the input dot moves to 0.7 V; the output dot stays at 1.0. 42.8 ("nine tenths"): input to 0.9 V; output still 1.0. 44.4 ("same clean one"): gate 2's gauge marker sits at the top of the 1 band and pulses | In 41.9 s (on "Seven tenths"), out 48.6 s: above, left, "0.7 or 0.9 in → clean out" |
| 11 | 45.8-50.3 s | "It builds that one from its own power wire, not from its input." | 45.8 ("It builds"): the curve slides away. 47.7 ("own power wire"): the 1 V rail above gate 2 glows rust and rust current runs down from the rail into gate 2's output. 48.7 ("not from its input"): gate 2's input wire shows a small grey "valve" tap: the input only turns it, no current flows from input to output | In 47.7 s (on "own power"), out 53.5 s: above, right, "power wires: 1 V and 0 V" |
| 12 | 50.3-56.8 s | "Say a bump drags a one down to seven tenths. The next gate still sends out a CLEAN one." | key state, hold about 5 s: 50.3 ("Say a bump"): all gates carry a 1; a bump (a short ripple) hits the wire between gate 1 and gate 2. 51.3 ("drags a one down"): gate 2's input gauge marker slides down; 52.9 ("seven tenths"): stops at 0.7 V (rust), readout "0.7". 53.5 ("The next gate"): gate 2 pulses. 55.8 ("CLEAN one"): gate 2's output gauge sits at 1.0, readout "1.0" | In 53.5 s (on "The next gate"), out 59.7 s: above, left, "0.7 in → 1.0 out" |
| 13 | 56.8-59.7 s | "Gate after gate, every bump is wiped away." | 56.8: bumps hit every wire segment along the chain; each gate's input gauge dips, each output gauge stays at 1.0, one gate after another, left to right. Below the chain, the faint ghost "copying" wire shows its level sinking 0.9 → 0.5 along its length | In 56.8 s (on "Gate after"), out 61.9 s: below the chain, "copying instead: 0.9 → 0.5" |
| 14 | 59.7-63.6 s | "That's regeneration: every gate puts the bit back in its lane." | 59.7: every output gauge pulses in its 1 band together; the ghost wire fades | In 59.7 s (on "That's regeneration"), out 63.6 s: above, right, "past the middle line → wrong bit" (the honest limit) |
| 15 | 63.6-70 s | "Clean ones and zeros, every time. Can gates add them up? That's episode twelve." | fold back to the road with the ghost convoy in the upper lane, no dog (start frame), 63.6-65.1 s | Nothing during the fold. In 65.1 s, to the end: end card in the subtitle area, boxed "follow the lane, not the wobble". In 67.15 s (on "That's episode"), to the end: "Episode 12 →" at the very bottom |

Checked: planned end 70 s (1.5 s end-card hold), folds 25-26.97 s and 63.6-65.1 s: max 3 at once, 1.5 s apart, 2.5 s each, nothing in folds.

## 4. HTML animation guidelines

The brief for the figure. CLAUDE.md is the authority on style, colour, fonts and physics; this lists only what is specific to this episode.

**No figure exists yet.** New slug, for example `regen-convoy`. Reuse the two-lane road look of episode 10's `noise-margin-road` brief and the gate symbol from `src/figures/cmos-inverter-taps` (read only; copy, do not edit). The analogy changed from the CSV's "repeat the message loudly" to a convoy (2026-10-31): repeating loudly still passes a misheard word on, while a driver steering by the lane lines really does throw the wobble away, which is what a gate does.

- **Analogy object:** a two-lane road from above with a small dog that runs out in front of car 1, and a convoy of five isometric supercars (low wedge body, nose, cabin, rear spoiler, wheels), each with its number 1-5 on the roof and in a racing roundel on the side. Five distinct colours from the palette only: 1 rust (the active one), 2 light rust, 3 dark ink, 4 mid sepia, 5 cream. The dog is the flat 2D trotting dog (side profile sheared into its travel plane, wagging tail, soft ground shadow; not built from iso blocks), no collar. It fits because every driver already does this: follow the car ahead into its lane, but steer by the lane lines, never copying its wobble. The copying ghost convoy comes first so the real convoy's straight driving is a surprise. Colour pop: car 1 rust; lane lines white.
- **Circuit parts (at most 8):** one wire with five gate boxes in a chain; the 1 V power rail above and the 0 V ground rail below; a small upright 0-1 V gauge above each gate's output (two bands: 1 at the top, 0 at the bottom); the gate's transfer curve as an inset (input across, output up, S-shaped); an input dot and an output dot on the curve; one readout (the active voltage); the faint ghost "copying" wire below.
- **Scene order and holds (each F mark):**
  1. Entrance with the convoy as faint ghosts (the copying world). The dog trots across in front of car 1; car 1 swerves; cars 2-5 each copy the swerve ahead and add their own, so it grows car by car; car 5 crosses the middle line and gets the red dashed warning outline (stroke 4.5, dash 10 6). The ghosts fade.
  2. The real convoy, solid. It changes lane: car 1 first, cars 2-5 follow one by one, each settling in the middle of the new lane.
  3. The dog crosses again; car 1 swerves twice, dying away; cars 2-5 stay straight; the lane lines brighten (leave free paper for olive arrows from car 3 to the lines).
  4. Car 5 pulses once, dead in the middle of its lane.
  5. Fold: road → wire; cars → five gate boxes in a chain; rails above and below; a gauge above each gate.
  6. **Strict beat-by-beat for the circuit lines (each event lands on its word; times in section 3, rows 8-14):**
     - **"Each car is a gate."** The five gates pulse left to right. Nothing else moves.
     - **"Its lane is the bit: one near one volt, zero near zero."** Every gauge draws its two bands; the top bands ("1") pulse on "one near one volt", the bottom bands ("0") on "zero near zero".
     - **"A gate is touchy only at the middle line, half a volt."** Gate 2 highlights; its S-curve slides up beside it; on "half a volt" a dashed line marks 0.5 V on the input axis and the steep middle outlines in rust.
     - **"There, a tiny nudge swings its output all the way."** On "a tiny nudge" the input dot hops 0.45 → 0.55 V (short). On "swings its output" the output dot jumps 0.17 → 0.83 V (a long rust arrow). On "all the way" gate 2's gauge marker jumps from the 0 band to the 1 band. The contrast short-hop / long-jump is the whole point.
     - **"Inside a lane, it hardly reacts. Seven tenths or nine tenths, it gives the same clean one."** The flat top of the curve highlights; the input dot moves to 0.7 on "Seven tenths" and to 0.9 on "nine tenths"; the output dot does not move from 1.0; the gauge marker pulses at the top of the 1 band on "same clean one".
     - **"It builds that one from its own power wire, not from its input."** The curve slides away; on "own power wire" the 1 V rail above gate 2 glows rust and current runs from the rail into the output; on "not from its input" the input wire is shown ending at a small grey valve on the gate (it only turns it; no current flows input → output).
     - **"Say a bump drags a one down to seven tenths. The next gate still sends out a CLEAN one."** Key state, hold about 5 s: all gates carry a 1; a ripple hits the wire between gate 1 and gate 2; gate 2's input gauge marker slides down and stops at 0.7 (rust, readout "0.7") on "seven tenths"; on "CLEAN one" gate 2's output gauge sits at 1.0 (readout "1.0").
     - **"Gate after gate, every bump is wiped away."** Ripples hit every segment; each input gauge dips, each output gauge stays at 1.0, left to right; below, the ghost copying wire's level sinks 0.9 → 0.5 along its length.
     - **"That's regeneration: every gate puts the bit back in its lane."** All output gauges pulse in the 1 band together; the ghost wire fades.
  7. Rules for this stretch: one thing moves at a time; every move starts on its word; only the gauges, the curve dots, the rail glow and the ripples change; no labels beyond "1", "0", "0.5 V" and the readout.
  8. Fold back to the road, ghost convoy in the upper lane (start frame).
- **Computed in model.ts:** each gate is a buffer (two inverters with gain about 8 at 0.5 V, flat outside about 0.39-0.61 V); every output computed from its input through that curve; ripples added between gates; the copying wire as input + bump with no restoring; the gauges and readout. Check (verified by script, example numbers): 0.45 → 0.55 V in gives about 0.17 → 0.83 V out; 0.7 and 0.9 V in both give about 1.0 V out; a bumped 0.7 → 1.0; copying, five bumps of 0.08 V: 0.9 → 0.5 V; a level past 0.5 V comes out as the wrong bit.
- **Free space for drawing:** paper above the board for up to 3 notes (left and right); free board beside gate 2 for the curve inset; room beside car 3 for olive arrows; one line below the chain for the copying note.
- **Rules from CLAUDE.md that matter here:** rust only for the cars, active levels, the steep part of the curve, rail current and the bumped marker; no olive or green in the figure; one ROLLIN engraving on the board's front face and at most one in-story ROLLIN (a road sign); no real-world scene.
- **Files:** `shorts/chip-design/11 What is the regenerative property of logic gates/What is the regenerative property of logic gates (convoy).html`. After the voice is recorded, sync to it (voice.ts) and redo the times in section 3.
