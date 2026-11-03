```txt
[confident] One tap, two speakers, but your squeal never STOPS.

Nobody is talking. So why won't the squeal stop?

[warmly] See, the squeal is a loop. The mic hears the speakers. They play what it hears, louder.

Each trip doubles it: one, two, four, eight. The loop keeps itself going.

So move the speakers away. Each trip loses half, and the loop dies out.

[thoughtful] A loop that grows on itself won't stop. Let's understand this in episode twenty-six of chip design.

[pause] Now, the same with bits.

In a CMOS chip, a P-moss and an N-moss sit close together. Here's the weird part. Between them hide two unwanted transistors, each turning the other on.

A spike starts a small current. Each transistor doubles it, like the mic and speakers.

[slightly excited] Soon a huge current runs from V D D to ground. It STAYS.

That's latch-up. It fades, right? Nope. It heats the chip until power is cut.

The fix? Guard rings soak up that stray current. Now each trip loses half.

[thoughtful] Basically, doubling each trip never stops. Halving each trip dies out.

[confident] One tap, one loop, one squeal.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 198 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. "Latch-up" is said as one word; "V D D" as letters. Model numbers (scratch): loop gain per trip 2 without guard rings (1, 2, 4, 8, 16 ... until the current is limited only by the chip itself), 1/2 with guard rings (1, 1/2, 1/4, 1/8: dies out). Physics: the parasitic PNP (P-moss source, N-well, substrate) and NPN (N-moss source, substrate, N-well) form a thyristor; once on it holds until the supply is removed.

Times are planned (about 3 words per second, video 72.5 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] One tap, two speakers, but your squeal never STOPS. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>latchup-squeal</code>. A small stage on the board: a microphone on a stand in the centre and two speaker boxes on either side, facing it, joined by a cable to a small amplifier box at the back (one ROLLIN maker's plate on the amplifier) with a power switch. Sound is drawn as rust arcs spreading in front of each speaker (effects start in front of the emitter). Below the board: one readout, "loudness", a bar graph of the last few trips round the loop. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("One tap"): a flat 2D hand (side profile, soft ground shadow) taps the mic once. 0.7 ("two speakers"): both speakers puff a small arc. 1.7 ("your squeal"): the arcs grow trip by trip into a steady loud squeal (dense rust arcs); the loudness bars double each trip and stay at the top. 2.3 ("never STOPS"): the hand is gone; the squeal holds. Then the power switch flips off; silence; on again (the start frame: quiet). | NOTE "no one is singing" · on "One tap" (0.0) · out "the squeal is" (6.9) · above right · tie arrow to the empty mic stand · hook |
| **3.3-6.3 s** Nobody is talking. So why won't the squeal stop? | 3.3 ("Nobody is talking"): the mic pulses (no hand). 5.0 ("won't the squeal stop"): the loudness readout pulses. Then the readout clears. | PEN ring · on "won't the squeal" (5.0) · round the mic · out "the squeal is" (6.9) |
| **6.6-10.3 s** [warmly] See, the squeal is a loop. The mic hears the speakers. | 7.9 ("a loop"): a thin rust line draws round the stage: mic, cable, amplifier, speakers, back to the mic. 8.6 ("The mic hears"): arcs from each speaker reach the mic. | NOTE "mic → amp → speakers → mic" · on "a loop" (7.9) · out "Each trip" (12.9) · above left · tie arrow to the loop line |
| **10.6-12.6 s** They play what it hears, louder. | 10.6 ("They play"): the hand taps the mic once; bar 1 rises to 1. 12.3 ("louder"): the speakers puff an arc twice as big; bar 2 rises to 2. | Nothing new. |
| **12.9-17.2 s** Each trip doubles it: one, two, four, eight. The loop keeps itself going. | 12.9 ("Each trip doubles"): a dot runs round the loop line once per trip. 14.2 ("one, two, four, eight"): bars 1, 2, 4, 8 in turn on the spoken numbers (computed: x 2 per trip). 16.2 ("keeps itself going"): the bars hit the top and stay; steady squeal. | NOTE "each trip: x 2" · on "doubles it" (13.6) · out "move the speakers" (17.8) · below left · tie arrow to the bars<br>PEN ring · on "keeps itself going" (16.2) · round the full bars · out "move the speakers" (17.8) |
| **17.5-22.2 s** So move the speakers away. Each trip loses half, and the loop dies out. | 17.8 ("move the speakers"): the power cuts the squeal; the speakers slide far apart from the mic, turned away. 19.8 ("loses half"): the hand taps again: bars 1, 1/2, 1/4 in turn (computed: x 1/2 per trip). 21.5 ("dies out"): silence. | NOTE "each trip: x 1/2" · on "loses half" (19.8) · out "won't stop" (24.5) · above right · tie arrow to the falling bars |
| **22.5-28.2 s** [thoughtful] A loop that grows on itself won't stop. Let's understand this in episode twenty-six of chip design. | 22.5 ("A loop that grows"): the speakers slide back; the squeal replays briefly, then the power cuts it. Steady hold, quiet. | NOTE "grows: stuck on, shrinks: gone" · on "A loop that grows" (22.5) · out fold (28.5) · below centre · tie none<br>NOTE "Episode 26" · on "episode twenty-six" (26.5) · out end · top right · tie none · badge |
| **28.5-30.5 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes a cut-away slice of a CMOS chip in the digital electronics style: VDD rail at the back, GND rail at the front. Left: a blue PMOS sitting in a shaded n-well; right: a red NMOS in the p-type substrate, close together. The mic and the two speakers become two hidden transistor shapes drawn faintly between them (a PNP from the PMOS side down into the substrate, an NPN from the NMOS side up into the n-well), wired into one loop. The loudness bars become a "current" bar readout. | Nothing new. |
| **30.8-34.8 s** In a CMOS chip, a P-moss and an N-moss sit close together. | 31.1 ("a CMOS chip"): the slice outlines. 32.5 ("P-moss"): the PMOS and its n-well pulse blue. 33.5 ("N-moss"): the NMOS pulses red. 34.1 ("close together"): a short bracket shows the gap between them. | NOTE "a hair apart in the silicon" · on "close together" (34.1) · out "A spike" (40.4) · above left · tie arrow to the bracket |
| **35.1-40.1 s** Here's the weird part. Between them hide two unwanted transistors, each turning the other on. | 37.4 ("two unwanted transistors"): the two hidden transistors fade in, outlined, each with a small label (PNP, NPN). 38.8 ("turning the other on"): the loop between them outlines; a ghost mic and speaker show over them for 1.5 s. | PEN box · on "two unwanted transistors" (37.4) · round the two hidden transistors · out "huge current" (46.4)<br>NOTE "PNP feeds NPN feeds PNP" · on "turning the other" (38.8) · out "small current" (41.7) · below right · tie arrow to the loop between them<br>NOTE "parasitic PNP + NPN" · on "two unwanted" (37.4) · out "A spike" (40.4) · outside the box · tie box |
| **40.4-45.4 s** A spike starts a small current. Each transistor doubles it, like the mic and speakers. | 40.4 ("A spike"): a short rust spike hits the NMOS output (an overshoot). 41.7 ("small current"): a thin rust line enters the NPN; bar 1. 43.1 ("doubles it"): the line thickens through the PNP and back; bars 2, 4, 8 (computed: x 2 per trip). 44.4 ("mic and speakers"): the loop line pulses. | NOTE "trigger: a spike or a zap" · on "A spike" (40.4) · out "It STAYS" (49.4) · above left · tie arrow to the spike<br>NOTE "x 2 per trip, like the squeal" · on "mic and speakers" (44.4) · out "It STAYS" (49.4) · below left · tie arrow to the bars |
| **45.7-50.0 s** [slightly excited] Soon a huge current runs from V D D to ground. It STAYS. | Key state. 46.4 ("huge current"): a thick solid rust strap runs VDD, PNP, NPN, GND; the current bar hits the top. 49.4 ("It STAYS"): the spike is long gone; the strap holds; a red dashed warning outline rings the slice. Computed in the model: current per trip = current x 2 until only the chip's own resistance limits it; it holds while the supply is on. The strap and the full bar hold through the next row (the longest hold). | PEN ring · on "It STAYS" (49.4) · round the thick strap · out "The fix" (55.3) · key |
| **50.3-55.0 s** That's latch-up. It fades, right? Nope. It heats the chip until power is cut. | 50.3 ("That's latch-up"): the warning outline pulses. 51.0 ("It fades"): the strap holds. 52.0 ("Nope"): the strap glows brighter. 52.6 ("heats the chip"): the slice tints warm rust. 54.0 ("power is cut"): the VDD rail goes dark; the strap vanishes; then VDD returns, no current. | NOTE "VDD shorted to GND, stuck" · on "That's latch-up" (50.3) · out "guard rings" (56.0) · above right · tie arrow to the warning outline |
| **55.3-60.0 s** The fix? Guard rings soak up that stray current. Now each trip loses half. | 56.0 ("guard rings"): two rings of contacts draw round the PMOS (tied to VDD) and the NMOS (tied to GND). 57.6 ("stray current"): the rings glow faintly as they collect it. 59.3 ("loses half"): a spike hits again: bars 1, 1/2, 1/4 (computed: x 1/2 per trip); the line fades; no strap. | NOTE "rings tied to VDD and GND" · on "guard rings" (56.0) · out fold (64.3) · below centre · tie arrow to the guard rings<br>PEN tick · on "loses half" (59.3) · beside the falling bars · out fold (64.3) |
| **60.3-64.0 s** [thoughtful] Basically, doubling each trip never stops. Halving each trip dies out. | 60.6 ("Doubling each trip"): a ghost of the rising bars beside the falling ones for 1.5 s. | NOTE "x 2: locks up, x 1/2: dies" · on "Doubling each trip" (60.6) · out fold (64.3) · above left · tie none |
| **64.3-72.5 s** [confident] One tap, one loop, one squeal. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 64.3-65.9 fold back: the slice becomes the stage, the hidden transistors the mic and speakers, the rings fold away (the start frame: quiet stage, speakers facing the mic). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "guard rings stop the loop" · at end-4 (68.5) · out end · end card · tie box |

## Caption

1 spike, x 2 every trip: how a chip shorts itself until power is cut.

#chipdesign #vlsi #semiconductors #aihardware #computerarchitecture
