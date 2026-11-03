```txt
[confident] Car one WOBBLES, but in car five, you don't.

A dog runs out. If each car copied the one ahead, the wobble would grow.

So how does car five stay straight? Let's watch.

[warmly] Car one changes lane. Every car behind follows.

But no driver copies the wobble. Each steers by the lane lines.

So car five drives dead straight.

[thoughtful] Follow the lane, not the wobble. Let's understand this in episode eleven of chip design.

[pause] Now, the same with bits.

Each car is a gate. Its lane is the bit: one high, zero low.

A gate is touchy only at the middle line. There, a tiny nudge swings its output all the way.

Inside a lane, it hardly reacts. Seven tenths or nine tenths: the same clean one.

It builds that one from its power wire, not its input.

Say a bump drags a one to seven tenths. The next gate passes that on, right? Not quite. [slightly excited] It sends out a CLEAN one.

Remember the lane lines? Gate after gate, every bump is wiped away.

[thoughtful] Basically, every gate puts the bit back in its lane. That's regeneration.

[curious] Clean ones and zeros, no wobbles. Can gates add them up? That's episode twelve.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 67 s planned; voice speed about 1.05. Re-record (story-style rewrite 2026-11-03). Numbers are said as "tenths"; keep them as written.

Times are planned (about 3 words per second, video 73.4 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Car one WOBBLES, but in car five, you don't. | Board lands (entrance): a two-lane road seen from above, white lane lines, one ROLLIN road sign at the roadside (the one in-story ROLLIN). Five isometric supercars (low wedge body, cabin, rear spoiler) numbered 1-5 on the roof and in a side roundel drive in the upper lane: 1 rust, 2 light rust, 3 dark ink, 4 mid sepia, 5 cream. Visual hook: 0.3: the flat 2D trotting dog (side profile, soft ground shadow, no collar) runs across just in front of car 1. 0.0 ("Car one WOBBLES"): car 1 swerves side to side. 1.7 ("car five"): car 5 pulses once, dead straight in its lane. | NOTE "car 1 swerves, car 5 straight" · on "Car one WOBBLES" (0.0) · out "So how does" (8.6) · above left · tie arrow to car 1 · hook |
| **3.3-8.3 s** A dog runs out. If each car copied the one ahead, the wobble would grow. | 3.3 ("A dog runs out"): the dog trots across in front of car 1 again; car 1 swerves. 4.6 ("If each car copied"): faint ghost copies of cars 2-5 appear over the real ones (the copying world). 6.0 ("the one ahead"): car 1 swerves again. 7.0 ("the wobble would grow"): ghost cars 2, 3, 4, 5 copy the swerve one after another, each a little wider. 8.0 ("grow"): ghost car 5 crosses the middle line and a red dashed warning outline (stroke 4.5, dash 10 6) appears round it. | NOTE "copying: wobble grows" · on "the wobble would" (7.0) · out "Car one changes" (11.9) · above right · tie arrow to ghost car 5 |
| **8.6-11.6 s** So how does car five stay straight? Let's watch. | 8.6 ("So how does"): the ghost cars and the warning outline fade; the real convoy drives on in the upper lane. 9.6 ("car five"): car 5 pulses once. | PEN ring · on "car five" (9.6) · round car 5 · out "Car one changes" (11.9) |
| **11.9-14.6 s** [warmly] Car one changes lane. Every car behind follows. | 11.9 ("Car one changes lane"): car 1 changes to the lower lane. 13.2 ("Every car behind follows"): cars 2, 3, 4, 5 follow it into the lower lane one after another, each settling in the middle. | NOTE "copy the lane change" · on "Every car behind" (13.2) · out "steers by" (17.2) · above left · tie arrow to cars 2-5 |
| **14.9-18.9 s** But no driver copies the wobble. Each steers by the lane lines. | 14.9 ("But no driver"): the dog trots across in front of car 1 again. 15.9 ("copies the wobble"): car 1 swerves twice, the swerve dying away; cars 2-5 stay straight. 18.2 ("lane lines"): the two lane lines of the lower lane brighten (one of them is the middle line between the two lanes). | NOTE "lane lines = the guide" · on "steers by" (17.2) · out "Follow the lane" (21.5) · above right · tie arrow to the lane lines<br>PEN arrow · on "lane lines" (18.2) · to the lane lines beside car 3 · out "dead straight" (20.5) |
| **19.2-21.2 s** So car five drives dead straight. | 19.2 ("So car five"): the convoy drives on. 20.5 ("dead straight"): car 5 pulses once, dead in the middle of its lane. | NOTE "car 1 wobbles → car 5 straight" · on "drives dead" (20.2) · out "episode eleven" (24.8) · above left · tie arrow to car 5 |
| **21.5-26.5 s** [thoughtful] Follow the lane, not the wobble. Let's understand this in episode eleven of chip design. | The real convoy drives straight in the lower lane. Hold. | NOTE "Episode 11" · on "episode eleven" (24.8) · out end · top right · tie none · badge |
| **26.8-28.8 s** [pause] Now, the same with bits. | Fold: the road turns into one horizontal wire; the five cars become five small gate boxes in a chain along it (each a buffer: the bit goes out as it came in; the gate symbol from <code>cmos-inverter-taps</code>); a power rail (VDD, 1 V) runs above the chain and a ground rail (GND, 0 V) below; above each gate's output a small upright 0-1 V gauge with two bands (the lanes, now upright). | Nothing new. |
| **29.1-33.8 s** Each car is a gate. Its lane is the bit: one high, zero low. | 29.1 ("Each car is a gate"): a ghost of the road shows over the wire for 1 s and melts into it;: the five gate boxes pulse left to right. 30.8 ("Its lane is the bit"): on every gauge the two bands draw in: the top band (0.75-1 V) labelled "1", the bottom band (0-0.25 V) labelled "0". 32.4 ("one high"): the top bands pulse. 33.1 ("zero low"): the bottom bands pulse. | NOTE "lane = bit: 1 high, 0 low" · on "Its lane is" (30.8) · out "a tiny nudge" (37.4) · above left · tie arrow to the gauges |
| **34.1-40.4 s** A gate is touchy only at the middle line. There, a tiny nudge swings its output all the way. | 34.1 ("A gate is touchy"): gate 2 highlights and its transfer curve slides up beside it in free board space: input along the bottom (0-1 V), output up the side (0-1 V), an S-shape: flat, steep in the middle, flat. 36.4 ("middle line"): a dashed line at 0.5 V on the input axis, and the steep middle of the curve outlines in rust. 37.4 ("a tiny nudge"): an input dot hops 0.45 → 0.55 V (visibly short). 38.4 ("swings its output"): the output dot jumps 0.17 → 0.83 V, a long rust arrow up the side. 39.4 ("all the way"): gate 2's gauge marker jumps from the 0 band to the 1 band. | NOTE "halfway between 0 and 1" · on "middle line" (36.4) · out "Inside a lane" (40.7) · above right · tie arrow to the dashed middle line<br>NOTE "steep: 0.45→0.55 in, 0.17→0.83 out" · on "swings its" (38.4) · out "Seven tenths" (42.7) · below right · tie arrow to the curve |
| **40.7-45.7 s** Inside a lane, it hardly reacts. Seven tenths or nine tenths: the same clean one. | 40.7 ("Inside a lane"): the curve's flat top highlights. 42.7 ("Seven tenths"): the input dot moves to 0.7 V; the output dot stays at 1.0. 43.7 ("nine tenths"): input to 0.9 V; output still 1.0. 44.7 ("same clean one"): gate 2's gauge marker sits at the top of the 1 band and pulses. | NOTE "0.7 or 0.9 in → clean out" · on "Seven tenths" (42.7) · out "power wire" (48.0) · above left · tie arrow to the input dot |
| **46.0-49.7 s** It builds that one from its power wire, not its input. | 46.0 ("It builds"): the curve slides away. 48.0 ("power wire"): the VDD rail above gate 2 glows rust and rust current runs down from the rail into gate 2's output. 48.7 ("not its input"): gate 2's input wire ends at a small grey valve on the gate: the input only turns it, no current flows from input to output. | NOTE "power wires: VDD and GND" · on "power wire" (48.0) · out "Not quite" (55.3) · above right · tie arrow to the VDD rail |
| **50.0-56.0 s** Say a bump drags a one to seven tenths. The next gate passes that on, right? Not quite. | Key state starts, hold about 5 s. 50.0 ("Say a bump"): all gates carry a 1; a bump (a short ripple) hits the wire between gate 1 and gate 2. 51.0 ("drags a one"): gate 2's input gauge marker slides down. 52.3 ("seven tenths"): it stops at 0.7 V (rust), readout "0.7". 54.0 ("passes that on"): a faint ghost readout "0.7?" shows at gate 2's output. 55.3 ("Not quite"): the ghost readout fades. | NOTE "a copy would pass 0.7 on" · on "passes that" (54.0) · out "CLEAN one" (57.6) · below left · tie arrow to the ghost readout |
| **56.3-58.3 s** [slightly excited] It sends out a CLEAN one. | Key state. 56.3 ("It sends"): gate 2 pulses. 57.6 ("CLEAN one"): gate 2's output gauge sits at 1.0, readout "1.0". Computed in the model: each gate is a buffer (two inverters, gain about 8 at 0.5 V, flat outside about 0.39-0.61 V); every output comes from its input through that curve; 0.45 → 0.55 V in gives about 0.17 → 0.83 V out; 0.7 and 0.9 V in both give about 1.0 V out. | NOTE "0.7 in → 1.0 out" · on "It sends" (56.3) · out "Gate after" (59.9) · above left · tie arrow to the readout<br>PEN ring · on "CLEAN one" (57.6) · round gate 2's output gauge · out "Basically" (62.9) · key |
| **58.6-62.6 s** Remember the lane lines? Gate after gate, every bump is wiped away. | 58.6 ("Remember the lane lines"): ghost lane lines show over the gauges' bands for 1 s. 59.9 ("Gate after gate"): bumps hit every wire segment along the chain; each gate's input gauge dips, each output gauge stays at 1.0, one gate after another, left to right. Below the chain, a faint ghost "copying" wire (input + bump, no restoring) shows its level sinking 0.9 → 0.5 along its length (computed: five bumps of 0.08 V). | NOTE "copying instead: 0.9 → 0.5" · on "Gate after" (59.9) · out "Basically" (62.9) · below centre · tie arrow to the ghost copying wire |
| **62.9-66.9 s** [thoughtful] Basically, every gate puts the bit back in its lane. That's regeneration. | 62.9 ("Basically"): every output gauge pulses in its 1 band together; the ghost wire fades. 66.2 ("That's regeneration"): hold. | NOTE "past the middle line → wrong bit" · on "Basically" (62.9) · out fold (67.2) · above right · tie none |
| **67.2-73.4 s** [curious] Clean ones and zeros, no wobbles. Can gates add them up? That's episode twelve. | 67.2-68.8 fold back: the wire becomes the road, the gate boxes become the five cars in the upper lane, no dog (the start frame). Held to the end. | NOTE "each gate cleans the bit" · at end-4 (69.4) · out end · end card · tie box |

## Caption

1 bump in, 1 clean bit out: why bits survive 1000s of gates.

#chipdesign #vlsi #semiconductors #aichips #computerarchitecture
