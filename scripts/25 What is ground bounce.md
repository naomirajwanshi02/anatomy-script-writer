```txt
[confident] Ten sinks drain, but your sink fills back UP.

You never pulled your plug. So why does your sink fill?

[warmly] See, ten sinks share one long drain pipe. Yours sits at the end.

One sink drains? Easy. Now all ten pull their plugs at once.

Here's the weird part. The pipe's water can't speed up. It backs up into your sink.

[thoughtful] A sudden rush backs up a shared pipe. Let's understand this in episode twenty-five of chip design.

[pause] Now, the same with bits.

The sinks become ten outputs. The pipe becomes the wire to one ground pin.

All ten switch to zero. Their charge rushes out through that pin.

That pin wire resists sudden current: inductance. So the chip's ground jumps up.

Your quiet output sits on that ground. It jumps up too.

[slightly excited] One output: a small bump. Ten together: TEN times, past the middle line.

Just a blip, right? Nope. The next chip reads a one never sent.

Basically, that's ground bounce. The fix? More ground pins, slower edges, decoupling capacitors.

[thoughtful] Ten outputs at once lift your quiet ground.

[confident] Ten sinks drain. Your sink fills.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 67 s planned; voice speed about 1.05. Model numbers (scratch): bump = outputs switching x per-output rush x pin wire inductance / ground pins; one output 6 % of a full swing, ten together 60 % (past the middle line at 50 %); five ground pins 12 %; edges twice as slow halve the bump; a decoupling capacitor beside the outputs supplies the rush locally.

Times are planned (about 3 words per second, video 73.3 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Ten sinks drain, but your sink fills back UP. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>ground-bounce-sinks</code>. Along the back of the board, a row of ten small isometric basins (numbered 1-10) plus your basin at the far left (plate YOURS, empty, a level gauge on its side with a dashed middle line). Each basin has a plug on a chain and a short down-pipe into one long horizontal drain pipe that runs along the front to a single outlet at the right board edge. One ROLLIN maker's plate on the drain pipe's outlet. Basins 1-10 are full of blue water. Below the board: one readout, "your sink level", a line graph against time with the middle line dashed. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Ten sinks drain"): all ten plugs lift together; ten streams drop into the drain pipe. 1.3 ("your sink fills"): the pipe backs up and water rises into your basin, past its gauge's middle line (graph spike, computed), then sinks away as the pipe catches up; basins 1-10 refill (the start frame). | NOTE "your plug never moved" · on "Ten sinks drain" (0.0) · out "ten sinks share" (7.6) · above right · tie arrow to your basin's plug · hook |
| **3.3-7.0 s** You never pulled your plug. So why does your sink fill? | 3.3 ("You never pulled"): your basin's plug pulses (still in). 5.0 ("So why"): the drain pipe pulses. 6.0 ("your sink fill"): the graph clears. | PEN ring · on "So why does" (5.0) · round your basin · out "ten sinks share" (7.6) |
| **7.3-11.6 s** [warmly] See, ten sinks share one long drain pipe. Yours sits at the end. | 7.6 ("ten sinks share"): the ten down-pipes flash in turn, then the long drain pipe end to end. 10.3 ("sits at the end"): your basin outlines. | NOTE "one pipe for all ten" · on "one long drain" (8.6) · out "One sink drains" (11.9) · above left · tie arrow to the drain pipe |
| **11.9-13.2 s** One sink drains? Easy. | 11.9 ("One sink drains"): basin 1's plug lifts; its water runs down calmly. 12.9 ("Easy"): your basin's level twitches by a tiny amount (graph: a small bump, computed 6 %). | NOTE "1 sink: a tiny bump" · on "Easy" (12.9) · out "backs up" (20.2) · below left · tie arrow to the small bump |
| **13.5-16.2 s** Now all ten pull their plugs at once. | 13.8 ("all ten pull"): basin 1 refills; all ten plugs lift together. 15.5 ("at once"): ten streams drop into the pipe at the same moment. | PEN arrow · on "at once" (15.5) · to the ten down-pipes · out "backs up" (20.2) |
| **16.5-21.8 s** Here's the weird part. The pipe's water can't speed up. It backs up into your sink. | 18.8 ("can't speed up"): the water in the long pipe moves forward slowly, a heavy column (drawn as long streaks barely moving at first). 20.2 ("backs up"): water rises in the down-pipes. 20.8 ("into your sink"): water rises into your basin past the middle line (graph spike to 60 %, computed); then the pipe's flow builds up and your basin empties again. | NOTE "water is heavy to get moving" · on "can't speed up" (18.8) · out "A sudden rush" (22.1) · above right · tie arrow to the drain pipe's streaks |
| **22.1-27.8 s** [thoughtful] A sudden rush backs up a shared pipe. Let's understand this in episode twenty-five of chip design. | 22.1 ("A sudden rush"): the backup replays once, slowly. Steady hold, all basins refilled. | NOTE "in faster than it can leave" · on "A sudden rush" (22.1) · out fold (28.1) · above left · tie none<br>NOTE "Episode 25" · on "episode twenty-five" (26.1) · out end · top right · tie none · badge |
| **28.1-30.1 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics board (VDD rail at the back, GND rail at the front, both engraved). A flat chip outline sits on it. The ten basins become ten output drivers inside it (small inverter blocks, blue PMOS over red NMOS, each with an output lamp), your basin an eleventh driver at the left (plate YOURS) whose output line runs off the chip to a receiving gate with its own lamp at the right of the board. The down-pipes become the drivers' ground straps joining one internal ground bar; the long drain pipe becomes one thin coiled wire from that bar to a single ground pin on the GND rail (engraved L). Your output's graph stays: 0 to 1, middle line dashed. | Nothing new. |
| **30.4-35.1 s** The sinks become ten outputs. The pipe becomes the wire to one ground pin. | 30.4 ("The sinks become"): ghost basins show over the ten drivers and melt into them. 31.4 ("ten outputs"): the ten output lamps light (all 1). 32.1 ("The pipe becomes"): a ghost pipe melts into the coiled wire. 34.1 ("one ground pin"): the pin pulses. | NOTE "pin wire = drain pipe" · on "one ground pin" (34.1) · out "inductance" (41.7) · below right · tie arrow to the coiled wire |
| **35.4-39.4 s** All ten switch to zero. Their charge rushes out through that pin. | 35.4 ("All ten switch"): the ten drivers' inputs flip together; their NMOS gate bars light red; the ten lamps go out. 37.7 ("rushes out"): ten rust straps run from the outputs through the NMOS valves into the ground bar and squeeze into the one coiled wire. | NOTE "10 discharges at the same moment" · on "rushes out" (37.7) · out "inductance" (41.7) · above left · tie arrow to the ground bar |
| **39.7-44.0 s** That pin wire resists sudden current: inductance. So the chip's ground jumps up. | 40.7 ("resists sudden current"): the coiled wire glows; the rust dashes inside it start slowly. 41.7 ("inductance"): its L label pulses. 42.4 ("the chip's ground"): the internal ground bar lifts visibly above the GND rail (computed: bump = 10 x rush x L / 1 pin). 43.4 ("jumps up"): a ghost of the backed-up basin shows beside the bar for 1 s. | NOTE "inductance: resists a fast change" · on "inductance" (41.7) · out "Your quiet output" (44.3) · below left · tie arrow to the coiled wire |
| **44.3-48.0 s** Your quiet output sits on that ground. It jumps up too. | 44.3 ("Your quiet output"): your driver (input steady) pulses; its NMOS is on, its output tied to the internal ground bar. 47.0 ("jumps up too"): your output line lifts with the bar; your graph spikes. | PEN ring · on "jumps up too" (47.0) · round your output line · out "Just a blip" (52.9) |
| **48.3-52.6 s** [slightly excited] One output: a small bump. Ten together: TEN times, past the middle line. | Key state. 48.3 ("One output"): the drivers reset; only one switches: your graph shows a small bump (6 %). 50.0 ("Ten together"): all ten switch: your graph spikes to 60 %. 51.3 ("past the middle line"): the spike crosses the dashed middle line. Computed in the model: bump = outputs x per-output rush x L / pins. The 60 % spike stays on the graph through the next row (the longest hold). | PEN ring · on "TEN times" (50.6) · round the 60 % spike · out "the next chip" (54.6) · key<br>NOTE "10 x the rush = 10 x the bump" · on "Ten together" (50.0) · out "never sent" (56.6) · above right · tie arrow to the spike |
| **52.9-57.2 s** Just a blip, right? Nope. The next chip reads a one never sent. | 52.9 ("Just a blip"): the 60 % spike pulses. 54.2 ("Nope"): the dashed middle line pulses. 54.6 ("the next chip"): the receiving gate's lamp flickers on for a moment though your output was 0. | NOTE "a false 1 for a moment" · on "never sent" (56.6) · out "slower edges" (60.5) · right of the receiving gate · tie arrow to the flickering lamp |
| **57.5-61.8 s** Basically, that's ground bounce. The fix? More ground pins, slower edges, decoupling capacitors. | 57.8 ("That's ground bounce"): the internal ground bar's bump replays once. 59.5 ("More ground pins"): four more coiled wires and pins drop in beside the first; the ten switch again: the bump drops to 12 % (computed: 5 pins). 60.5 ("slower edges"): the drivers' input ramps slow to twice as long: the bump halves to 6 %. 61.2 ("decoupling capacitors"): a small glass charge tank (engraved C) drops in beside the drivers between the ground bar and VDD; the rush draws from it; the bump shrinks further. | NOTE "5 pins: 60 % → 12 %" · on "More ground pins" (59.5) · out fold (65.1) · above left · tie arrow to the extra pins<br>NOTE "local charge, no rush through pin" · on "decoupling capacitors" (61.2) · out fold (65.1) · below centre · tie arrow to the charge tank |
| **62.1-64.8 s** [thoughtful] Ten outputs at once lift your quiet ground. | 62.1 ("Ten outputs at once"): the extra pins and the tank slide out; the ten switch once more; your graph spikes past the line. 64.1 ("quiet ground"): a ghost of the backed-up basin beside your output for 1.5 s. | PEN tick · on "quiet ground" (64.1) · beside your graph's spike · out fold (65.1) |
| **65.1-73.3 s** [confident] Ten sinks drain. Your sink fills. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 65.1-66.7 fold back: the drivers become basins, the ground bar and coiled wire the drain pipe, your driver your empty basin; the graph clears (the start frame: ten full basins, plugs in). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "many switch together: ground jumps" · at end-4 (69.3) · out end · end card · tie box |

## Caption

10 outputs switch at once and a quiet one reads wrong: ground bounce.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
