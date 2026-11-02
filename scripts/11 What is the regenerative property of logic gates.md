```txt
[confident] Car one WOBBLES, but in car five, you don't.

If each car copied the one ahead, the wobble would grow.

So how does car five stay straight? Let's watch.

[warmly] Car one changes lane. Every car behind follows.

But no driver copies car one's wobble. Each driver steers by the lane lines.

So car five drives dead straight.

[thoughtful] Follow the lane, not the wobble. Let's understand this in episode eleven of chip design.

[pause] Now, the same with bits.

Each car is a gate. Its lane is the bit: one near one volt, zero near zero.

A gate is touchy only at the middle line, half a volt. There, a tiny nudge swings its output all the way.

Inside a lane, it hardly reacts. Seven tenths or nine tenths, it gives the same clean one.

It builds that one from its own power wire. Not from its input.

Say a bump drags a one down to seven tenths. [slightly excited] The next gate still sends out a CLEAN one.

Gate after gate, every bump is wiped away.

[thoughtful] That's regeneration: every gate puts the bit back in its lane.

[curious] Clean ones and zeros, no wobbles. Can gates add them up? That's episode twelve.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 198 words (<code>check-voice.py</code>: PASS), about 70 s planned; voice speed about 1.05. Re-record: the 2026-10-31 11:48 take uses the old text. Numbers are said as "tenths"; keep them as written.

Times are planned (about 3 words per second, video 70.0 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] Car one WOBBLES, but in car five, you don't. | Board lands (entrance): a two-lane road seen from above, white lane lines, one ROLLIN road sign at the roadside (the one in-story ROLLIN). Five isometric supercars (low wedge body, cabin, rear spoiler) numbered 1-5 on the roof and in a side roundel drive in the upper lane: 1 rust, 2 light rust, 3 dark ink, 4 mid sepia, 5 cream. Visual hook: 0.3: the flat 2D trotting dog (side profile, soft ground shadow, no collar) runs across just in front of car 1. 0.9 ("Car one WOBBLES"): car 1 swerves side to side. 2.0 ("car five"): car 5 pulses once, dead straight in its lane. | NOTE "car 1 swerves, car 5 straight" · on "Car one WOBBLES" (0.9) · out "So how does" (6.4) · above left · tie arrow to car 1 · hook |
| **2.7-6.4 s** If each car copied the one ahead, the wobble would grow. | 2.7 ("If each car copied"): faint ghost copies of cars 2-5 appear over the real ones (the copying world). 3.6 ("the one ahead"): car 1 swerves again. 4.3-5.8 ("the wobble would grow"): ghost cars 2, 3, 4, 5 copy the swerve one after another, each a little wider. 5.8 ("grow"): ghost car 5 crosses the middle line and a red dashed warning outline (stroke 4.5, dash 10 6) appears round it. | NOTE "copying: wobble grows" · on "the wobble would" (4.3) · out "Car one changes" (9.0) · above right · tie arrow to ghost car 5 |
| **6.4-9.0 s** So how does car five stay straight? Let's watch. | 6.4 ("So how does"): the ghost cars and the warning outline fade; the real convoy drives on in the upper lane. 7.5 ("car five"): car 5 pulses once. | PEN ring · on "car five" (7.5) · round car 5 · out "Car one changes" (9.0) |
| **9.0-11.7 s** [warmly] Car one changes lane. Every car behind follows. | 9.0 ("Car one changes lane"): car 1 changes to the lower lane. 10.4 ("Every car behind follows"): cars 2, 3, 4, 5 follow it into the lower lane one after another, each settling in the middle. | NOTE "copy the lane change" · on "Every car behind" (10.4) · out "steers by" (14.4) · above left · tie arrow to cars 2-5 |
| **11.7-16.4 s** But no driver copies car one's wobble. Each driver steers by the lane lines. | 11.7 ("But no driver"): the dog trots across in front of car 1 again. 12.6 ("car one's wobble"): car 1 swerves twice, the swerve dying away; cars 2-5 stay straight. 15.6 ("lane lines"): the two lane lines of the lower lane brighten (one of them is the middle line between the two lanes). | NOTE "lane lines = the guide" · on "steers by" (14.4) · out "Follow the lane" (19.8) · above right · tie arrow to the lane lines<br />PEN arrow · on "lane lines" (15.6) · to the lane lines beside car 3 · out "dead straight" (17.9) |
| **16.4-19.8 s** So car five drives dead straight. | 16.4: the convoy drives on. 17.4 ("car five"): car 5 pulses once, dead in the middle of its lane. | NOTE "car 1 wobbles → car 5 straight" · on "car five" (17.4) · out "episode eleven" (23.0) · above left · tie arrow to car 5 |
| **19.8-25.0 s** [thoughtful] Follow the lane, not the wobble. Let's understand this in episode eleven of chip design. | The real convoy drives straight in the lower lane. Hold. | NOTE "Episode 11" · on "episode eleven" (23.0) · out end · top right · tie none · badge |
| **25.0-27.0 s** [pause] Now, the same with bits. | Fold: the road turns into one horizontal wire; the five cars become five small gate boxes in a chain along it (each a buffer: the bit goes out as it came in; the gate symbol from <code>cmos-inverter-taps</code>); a power rail (1 V) runs above the chain and a ground rail (0 V) below; above each gate's output a small upright 0-1 V gauge with two bands (the lanes, now upright). | Nothing new. |
| **27.0-32.8 s** Each car is a gate. Its lane is the bit: one near one volt, zero near zero. | 27.0 ("Each car is a gate"): the five gate boxes pulse left to right. 28.6 ("Its lane is the bit"): on every gauge the two bands draw in: the top band (0.75-1 V) labelled "1", the bottom band (0-0.25 V) labelled "0". 30.2 ("one near one volt"): the top bands pulse. 31.5 ("zero near zero"): the bottom bands pulse. | NOTE "lane = bit: 1 near 1 V, 0 near 0 V" · on "Its lane is" (28.6) · out "half a volt" (35.4) · above left · tie arrow to the gauges |
| **32.8-39.9 s** A gate is touchy only at the middle line, half a volt. There, a tiny nudge swings its output all the way. | 32.8 ("A gate"): gate 2 highlights and its transfer curve slides up beside it in free board space: input along the bottom (0-1 V), output up the side (0-1 V), an S-shape: flat, steep in the middle, flat. 35.4 ("half a volt"): a dashed line at 0.5 V on the input axis, and the steep middle of the curve outlines in rust. 36.4 ("a tiny nudge"): an input dot hops 0.45 → 0.55 V (visibly short). 37.6 ("swings its output"): the output dot jumps 0.17 → 0.83 V, a long rust arrow up the side. 38.6 ("all the way"): gate 2's gauge marker jumps from the 0 band to the 1 band. | NOTE "middle line = 0.5 V: touchy" · on "middle line" (34.4) · out "Inside a lane" (39.9) · above right · tie arrow to the dashed 0.5 V line<br />NOTE "steep: 0.45→0.55 in, 0.17→0.83 out" · on "swings its" (37.6) · out "Seven tenths" (41.9) · below right · tie arrow to the curve |
| **39.9-45.8 s** Inside a lane, it hardly reacts. Seven tenths or nine tenths, it gives the same clean one. | 39.9 ("Inside a lane"): the curve's flat top highlights. 41.9 ("Seven tenths"): the input dot moves to 0.7 V; the output dot stays at 1.0. 42.8 ("nine tenths"): input to 0.9 V; output still 1.0. 44.4 ("same clean one"): gate 2's gauge marker sits at the top of the 1 band and pulses. | NOTE "0.7 or 0.9 in → clean out" · on "Seven tenths" (41.9) · out "own power" (47.7) · above left · tie arrow to the input dot |
| **45.8-50.3 s** It builds that one from its own power wire. Not from its input. | 45.8 ("It builds"): the curve slides away. 47.7 ("own power wire"): the 1 V rail above gate 2 glows rust and rust current runs down from the rail into gate 2's output. 48.9 ("Not from its input"): gate 2's input wire ends at a small grey valve on the gate: the input only turns it, no current flows from input to output. | NOTE "power wires: 1 V and 0 V" · on "own power" (47.7) · out "The next gate" (53.5) · above right · tie arrow to the 1 V rail |
| **50.3-56.8 s** Say a bump drags a one down to seven tenths. [slightly excited] The next gate still sends out a CLEAN one. | Key state, hold about 5 s. 50.3 ("Say a bump"): all gates carry a 1; a bump (a short ripple) hits the wire between gate 1 and gate 2. 51.3 ("drags a one down"): gate 2's input gauge marker slides down. 52.9 ("seven tenths"): it stops at 0.7 V (rust), readout "0.7". 53.5 ("The next gate"): gate 2 pulses. 55.8 ("CLEAN one"): gate 2's output gauge sits at 1.0, readout "1.0". Computed in the model: each gate is a buffer (two inverters, gain about 8 at 0.5 V, flat outside about 0.39-0.61 V); every output comes from its input through that curve; 0.45 → 0.55 V in gives about 0.17 → 0.83 V out; 0.7 and 0.9 V in both give about 1.0 V out. | NOTE "0.7 in → 1.0 out" · on "The next gate" (53.5) · out "Gate after" (56.8) · above left · tie arrow to the readout<br />PEN ring · on "CLEAN one" (55.8) · round gate 2's output gauge · out "That's regeneration" (59.7) · key |
| **56.8-59.7 s** Gate after gate, every bump is wiped away. | 56.8 ("Gate after gate"): bumps hit every wire segment along the chain; each gate's input gauge dips, each output gauge stays at 1.0, one gate after another, left to right. Below the chain, a faint ghost "copying" wire (input + bump, no restoring) shows its level sinking 0.9 → 0.5 along its length (computed: five bumps of 0.08 V). | NOTE "copying instead: 0.9 → 0.5" · on "Gate after" (56.8) · out "That's regeneration" (59.7) · below centre · tie arrow to the ghost copying wire |
| **59.7-63.6 s** [thoughtful] That's regeneration: every gate puts the bit back in its lane. | 59.7 ("That's regeneration"): every output gauge pulses in its 1 band together; the ghost wire fades. | NOTE "past the middle line → wrong bit" · on "That's regeneration" (59.7) · out fold (63.6) · above right · tie none |
| **63.6-70.0 s** [curious] Clean ones and zeros, no wobbles. Can gates add them up? That's episode twelve. | 63.6-65.1 fold back to the road: the wire becomes the road, the gate boxes become the five cars in the upper lane, no dog (the start frame). Held to 70.0 s. | NOTE "each gate cleans the bit" · at end-4 (66.0) · out end · end card · tie box |

## Caption

Why a 1 stays a clean 1 after passing through gate after gate.

#chipdesign #vlsi #semiconductors #aichips #computerarchitecture
