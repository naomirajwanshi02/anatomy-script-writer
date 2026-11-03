```txt
[confident] Two tanks, one wall, but your level JUMPS.

Someone poured water in, right? Nope. So what lifts your level?

[warmly] See, your tank shares a thin rubber wall with its neighbour. Your drain is open, so your level sits low.

Here's the weird part. The neighbour fills fast. Its water bends the wall into your tank. Your level jumps a third.

When the neighbour stops, the wall stops. Your drain lets the bump out.

[thoughtful] A changing neighbour pushes through the wall. Let's understand this in episode twenty-three of chip design.

[pause] Now, the same with bits.

Each tank becomes a wire, side by side.

The thin wall becomes the capacitance between the wires, called coupling.

Your wire holds a zero. A driver ties it to ground, like the drain.

One neighbour switches to one. Your wire jumps a third of the way.

[slightly excited] Both neighbours switch together: your wire jumps HALF way. The next gate may read a one.

Basically, that's crosstalk. Spread the wires apart: a fifth. A grounded shield between: almost none.

[thoughtful] Your level jumps only while a neighbour switches.

[confident] Two tanks, one wall, one jump.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 199 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. Model numbers (scratch): coupling to ground ratio 1 : 2 per side; jump = coupling / (coupling + ground): one neighbour 1/3, both 2/4 = 1/2, wires spaced so coupling halves 0.5/2.5 = 1/5, grounded shield between about 0.

Times are planned (about 3 words per second, video 72.8 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] Two tanks, one wall, but your level JUMPS. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>crosstalk-tanks</code>, on the taps kit (<code>src/iso/taps/</code>). Three tall glass tanks in a row, touching: a left neighbour, your tank (centre, engraved YOURS on a small plate) and a right neighbour. The walls between them are thin rubber sheets (drawn slightly wavy, sepia); the outer walls are glass. A high supply pipe along the back has a fill tap over each neighbour; your tank has a drain tap at its foot, open, to a floor drain gutter at the front; your level sits low. A level gauge beside your tank has a dashed middle line. One ROLLIN maker's plate on the supply pipe. Below the board: one readout, "your level", a line graph against time with the middle line dashed. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Two tanks"): your tank and the left neighbour pulse. 0.7 ("one wall"): the rubber wall between them outlines. 1.7 ("your level JUMPS"): the left neighbour's tap opens wide and its level shoots up; the rubber wall bulges into your tank and your level jumps a third of the way up (graph: a spike); then the neighbour's tap shuts and your drain lets the bump out. The two levels side by side, the neighbour high and yours bumped, are the start frame's question. | NOTE "your tank: nobody touched it" · on "Two tanks" (0.0) · out "So what lifts" (5.0) · above right · tie arrow to your tank · hook<br>PEN underline · on "JUMPS" (2.3) · under "nobody touched it" · out "So what lifts" (5.0) |
| **3.0-6.7 s** Someone poured water in, right? Nope. So what lifts your level? | 3.0 ("Someone poured"): a ghost jug tilts over your tank. 4.7 ("Nope"): the ghost jug fades without pouring. 5.0 ("So what lifts"): the left neighbour drains back to low and the graph clears (the start frame). | PEN ring · on "So what lifts" (5.0) · round your tank's level · out "your tank shares" (7.3) |
| **7.0-10.7 s** [warmly] See, your tank shares a thin rubber wall with its neighbour. | 7.3 ("your tank shares"): your tank pulses. 8.7 ("thin rubber wall"): the left rubber wall outlines and wobbles slightly. | NOTE "rubber: it bends, water can't pass" · on "thin rubber wall" (8.7) · out "The neighbour fills" (15.6) · above left · tie arrow to the left rubber wall |
| **11.0-14.0 s** Your drain is open, so your level sits low. | 11.0 ("Your drain"): your drain tap pulses; a thin stream runs to the gutter. 13.3 ("sits low"): your level and the gauge's low mark pulse. | NOTE "open drain holds it low" · on "Your drain" (11.0) · out "Its water bends" (17.0) · below left · tie arrow to your drain tap |
| **14.3-21.3 s** Here's the weird part. The neighbour fills fast. Its water bends the wall into your tank. Your level jumps a third. | 15.6 ("The neighbour fills"): the left neighbour's tap opens wide; its level rises fast (computed). 17.6 ("bends the wall"): the rubber wall bulges into your tank, its bulge following the neighbour's rise. 20.3 ("jumps a third"): your level rises a third of the way to the top while the neighbour rises; the graph draws the jump (computed: jump = coupling / (coupling + ground) = 1/3). | NOTE "fast fill = hard push" · on "fills fast" (16.3) · out "When the neighbour" (21.6) · left of the neighbour · tie arrow to the rising neighbour<br>NOTE "only while it is rising" · on "bends the wall" (17.6) · out "the bump out" (24.9) · above right · tie arrow to the bulging wall |
| **21.6-25.9 s** When the neighbour stops, the wall stops. Your drain lets the bump out. | 21.6 ("When the neighbour stops"): the neighbour is full; its tap shuts; the wall stops moving. 24.9 ("the bump out"): your drain lets the extra water out; your level sinks back low; the graph's spike decays. | NOTE "steady neighbour: no push" · on "When the neighbour" (21.6) · out "episode twenty-three" (29.9) · below left · tie arrow to the still wall |
| **26.2-31.5 s** [thoughtful] A changing neighbour pushes through the wall. Let's understand this in episode twenty-three of chip design. | 26.2 ("A changing neighbour"): the left neighbour drains and fills once more; the jump repeats on the graph. Steady hold. | PEN tick · on "A changing neighbour" (26.2) · beside the graph's spike · out fold (31.8)<br>NOTE "Episode 23" · on "episode twenty-three" (29.9) · out end · top right · tie none · badge |
| **31.8-33.8 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics CMOS board (VDD rail at the back, GND rail at the front, both engraved). The three tanks become three long parallel wires across the board: neighbour A, your wire (centre, plate YOURS), neighbour B; each starts at a small driver inverter (blue PMOS over red NMOS) on the left with an input lever, and your wire ends at a receiving inverter on the right with an output lamp. The rubber walls become small coupling capacitors (two short plates) between your wire and each neighbour, at three places along the wires; each wire also has a small capacitor to the GND rail. Your driver's lever sits at 1, so its NMOS is on and ties your wire to GND (the drain). The graph stays: "your wire", 0 to 1, middle line dashed. | Nothing new. |
| **34.1-36.8 s** Each tank becomes a wire, side by side. | 34.1 ("Each tank"): a ghost of each tank fades over its wire and melts into it. 35.8 ("side by side"): the three wires flash in turn, left to right. | NOTE "metal lines a hair apart" · on "side by side" (35.8) · out "called coupling" (40.1) · above left · tie arrow to the three wires |
| **37.1-40.8 s** The thin wall becomes the capacitance between the wires, called coupling. | 37.1 ("The thin wall"): a ghost rubber wall shows between your wire and neighbour A and melts into the coupling capacitors. 40.1 ("called coupling"): the coupling capacitors pulse. | NOTE "coupling capacitance = shared wall" · on "called coupling" (40.1) · out "One neighbour" (46.1) · above right · tie arrow to a coupling capacitor |
| **41.1-45.8 s** Your wire holds a zero. A driver ties it to ground, like the drain. | 41.1 ("Your wire holds"): your wire and its "0" tag pulse. 43.4 ("ties it to ground"): your driver's NMOS gate bar lights red; its strap to GND outlines. 44.8 ("like the drain"): a ghost drain tap beside your driver for 1 s. | NOTE "driver NMOS on = open drain" · on "ties it to ground" (43.4) · out "One neighbour switches" (46.1) · below left · tie arrow to your driver's NMOS |
| **46.1-50.4 s** One neighbour switches to one. Your wire jumps a third of the way. | 46.1 ("One neighbour switches"): neighbour A's lever flips; its wire charges fast to 1 (rust). 48.4 ("jumps a third"): your wire's level jumps a third of the way (rust bump along it), the graph spikes to 1/3 and decays as your NMOS pulls it back down (computed). | PEN ring · on "jumps a third" (48.4) · round the graph's 1/3 spike · out "Both neighbours" (50.7) |
| **50.7-56.0 s** [slightly excited] Both neighbours switch together: your wire jumps HALF way. The next gate may read a one. | Key state. 50.7 ("Both neighbours"): both neighbours' levers flip together; both wires charge fast. 52.7 ("jumps HALF way"): your wire jumps to the middle line; the graph spikes to 1/2 (computed: (1 + 1) / (1 + 1 + 2) = 1/2). The dashed middle line on the graph pulses. 54.7 ("may read a one"): the receiving inverter's output lamp flickers once (a wrong 0 for a moment; computed: at the switching middle). The 1/2 spike stays on the graph with the dashed middle line through the next row (the longest hold). | PEN ring · on "jumps HALF way" (52.7) · round the graph's 1/2 spike · out "That's crosstalk" (56.6) · key<br>NOTE "1 + 1 shares of 4 = half" · on "Both neighbours" (50.7) · out "the next gate" (53.7) · above right · tie arrow to the two neighbour wires<br>NOTE "wrong bit for a moment" · on "may read a one" (54.7) · out "Spread the wires" (57.3) · right of the receiving inverter · tie arrow to the flickering lamp |
| **56.3-61.3 s** Basically, that's crosstalk. Spread the wires apart: a fifth. A grounded shield between: almost none. | 56.6 ("That's crosstalk"): the jump replays once. 57.3 ("Spread the wires"): the neighbours slide apart to twice the gap; the coupling capacitors shrink to half size. 58.6 ("a fifth"): both neighbours switch again; your graph spikes to 1/5 (computed: 0.5 / 2.5). 59.3 ("a grounded shield"): a thin wire tied to GND slides in between your wire and each neighbour (plate SHIELD); the coupling capacitors now join the shields. 60.6 ("almost none"): both neighbours switch; your graph stays nearly flat. | NOTE "gap x 2: 1/3 → 1/5" · on "a fifth" (58.6) · out "almost none" (60.6) · below left · tie arrow to the widened gap<br>NOTE "shield: push goes to ground" · on "grounded shield" (59.6) · out "only while" (62.6) · above left · tie arrow to a shield wire |
| **61.6-64.3 s** [thoughtful] Your level jumps only while a neighbour switches. | 61.6 ("Your level jumps"): the shields slide out; neighbour A switches once more; your graph spikes while its edge rises and is flat once it is steady (computed). | NOTE "edge = jump, steady = quiet" · on "Your level jumps" (61.6) · out fold (64.6) · above right · tie arrow to the spike |
| **64.6-72.8 s** [confident] Two tanks, one wall, one jump. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 64.6-66.2 fold back: the wires become the three tanks, the coupling capacitors the rubber walls, your NMOS the open drain; the graph clears (the start frame). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "close wires talk while they switch" · at end-4 (68.8) · out end · end card · tie box |

## Caption

2 wires a hair apart: a switching neighbour can flip your bit.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
