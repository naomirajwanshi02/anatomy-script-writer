```txt
[confident] Ten flushes, ten refills, but you never WAIT.

So why do you never wait for a refill?

[warmly] See, your cistern refills right after each flush.

The next flush just opens a drain. Nothing has to fill first.

Now add three taps in a row. It drains only if all are open.

[thoughtful] Full before each flush, open only when needed. Let's understand this in episode twenty-seven of chip design.

[pause] Now, the same with bits.

The cistern becomes a gate's output, holding charge. The taps become three N-moss switches in a row: A, B, C.

First the clock is low: a P-moss fills the output to one. That's precharge.

Then the clock goes high: evaluate. It drains only if A, B and C are one.

So it's a three-input NAND.

Here's the trick. One switch per input, plus two. Static CMOS needs two per input.

Eight inputs: sixteen switches static, just TEN dynamic. Fewer switches, faster.

Perfect, right? Nope. Inputs can't change during evaluate. Once drained, it can't refill until the next clock.

[thoughtful] Basically, refill first, drain if needed: that's dynamic logic.

[confident] Full first, so you never wait.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 67 s planned; voice speed about 1.05. Model numbers (scratch): output = NOT(A AND B AND C) after evaluate; precharge with the clock low (PMOS on), evaluate with the clock high (footer NMOS on); switches: static CMOS NAND = 2 per input (8 inputs: 16), dynamic = 1 per input + 2 (8 inputs: 10); no keeper drawn.

Times are planned (about 3 words per second, video 73.6 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] Ten flushes, ten refills, but you never WAIT. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>dynamic-cistern</code>, on the taps kit (<code>src/iso/taps/</code>). A toilet cistern on the board, cut away at the front so its water shows (blue #2f6fb8), with a float refill valve fed by a supply pipe from the back, a flush handle on its side and an outlet at its foot into a floor drain. One ROLLIN maker's plate on the cistern lid. Below the board: a readout "wait for water", a small counter of flushes and the seconds waited (0). Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Ten flushes"): the handle flushes; the cistern empties at once; the float drops and the valve refills it straight away; this repeats quickly, the flush counter rolling 1 to 10. 2.0 ("never WAIT"): the wait counter stays at 0 the whole time (computed: the next flush starts from a full cistern). | NOTE "full again before you need it" · on "ten refills" (0.7) · out "your cistern refills" (6.6) · above right · tie arrow to the full cistern · hook |
| **3.0-6.0 s** So why do you never wait for a refill? | 4.3 ("never wait"): the wait counter's 0 pulses, then the counters reset; the cistern sits full (the start frame). | PEN ring · on "never wait" (4.3) · round the wait counter · out "your cistern refills" (6.6) |
| **6.3-9.0 s** [warmly] See, your cistern refills right after each flush. | 7.3 ("refills right after"): one flush, then the float valve refills the cistern slowly while nothing else happens. Then the full cistern pulses. | NOTE "refill = done in advance" · on "refills right after" (7.3) · out "Now add" (13.6) · above left · tie arrow to the float valve |
| **9.3-13.3 s** The next flush just opens a drain. Nothing has to fill first. | 10.3 ("just opens a drain"): the handle flushes; the outlet opens and the cistern empties fast. 11.6 ("Nothing has to fill"): a ghost empty cistern beside it shows a slow fill that is not needed, then fades. | NOTE "draining is the only fast job" · on "opens a drain" (10.6) · out "all are open" (17.3) · below left · tie arrow to the outlet |
| **13.6-18.3 s** Now add three taps in a row. It drains only if all are open. | 14.3 ("three taps in a row"): three small taps (engraved A, B, C) drop into the outlet pipe one after another. 16.6 ("only if all"): A and B open, C shut: no water runs; then C opens: the cistern empties (computed: drains only if A AND B AND C). | PEN box · on "three taps in a row" (14.3) · round the three taps · out "Full before" (18.6)<br>NOTE "A AND B AND C" · on "only if all" (16.6) · out "episode twenty-seven" (22.6) · outside the box · tie box |
| **18.6-24.3 s** [thoughtful] Full before each flush, open only when needed. Let's understand this in episode twenty-seven of chip design. | 18.6 ("Full before"): the cistern refills; all three taps shut. Steady hold. | NOTE "Episode 27" · on "episode twenty-seven" (22.6) · out end · top right · tie none · badge |
| **24.6-26.6 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics CMOS board (VDD rail at the back, GND rail at the front, both engraved). The supply pipe and float valve become a blue PMOS valve from VDD to the output node; the cistern becomes the glass output tank on that node (water turns rust), with an output lamp; the three taps become three red NMOS valves in series below the node (engraved A, B, C), each with an input lever on the left; the flush handle becomes a clock lever (CLK) driving both the PMOS and a fourth red NMOS at the bottom of the stack, to GND (the footer). Below the board: a truth table (A B C, output) with 8 rows, DE style, the current row highlighted; and a switch count card (inputs, static, dynamic). | Nothing new. |
| **26.9-29.6 s** The cistern becomes a gate's output, holding charge. | 26.9 ("The cistern becomes"): a ghost cistern shows over the output tank and melts into it. 28.9 ("holding charge"): the output tank pulses. | NOTE "output tank = node charge" · on "holding charge" (28.9) · out "precharge" (38.5) · above right · tie arrow to the output tank |
| **29.9-33.9 s** The taps become three N-moss switches in a row: A, B, C. | 30.9 ("three N-moss switches"): the three series NMOS valves pulse red in turn. 32.9 ("A, B, C"): the three input levers pulse. | NOTE "series: every switch must be on" · on "three N-moss" (30.9) · out "evaluate" (40.9) · below left · tie arrow to the NMOS stack |
| **34.2-38.9 s** First the clock is low: a P-moss fills the output to one. That's precharge. | 34.5 ("the clock is low"): CLK lever goes to 0. 35.9 ("a P-moss fills"): the PMOS gate bar lights blue; a solid rust strap from VDD fills the output tank to the top; the footer NMOS is off. 38.5 ("precharge"): the lamp lights (output 1). | PEN arrow · on "a P-moss fills" (35.9) · to the VDD strap · out "Then the clock" (39.2)<br>NOTE "clock 0: fill to 1" · on "That's precharge" (38.2) · out "evaluate" (40.9) · above left · tie arrow to the PMOS |
| **39.2-44.5 s** Then the clock goes high: evaluate. It drains only if A, B and C are one. | 39.5 ("the clock goes high"): CLK to 1: the PMOS goes dark, the footer NMOS lights red. 40.9 ("evaluate"): A = 1, B = 1, C = 0: no path; the tank stays full; table row 110 → 1 highlighted. 41.9 ("only if A, B and C"): C flips to 1: all four NMOS lit; the tank drains to GND through the stack; the lamp goes out; table row 111 → 0 highlighted (computed). | NOTE "clock 1: drain if all are 1" · on "evaluate" (40.9) · out "three-input NAND" (45.8) · above right · tie arrow to the footer NMOS |
| **44.8-46.5 s** So it's a three-input NAND. | 45.8 ("three-input NAND"): the truth table fills: seven rows give 1, row 111 gives 0 (computed: output = NOT(A AND B AND C)). | PEN ring · on "three-input NAND" (45.8) · round row 111 of the table · out "Eight inputs" (52.1) |
| **46.8-51.8 s** Here's the trick. One switch per input, plus two. Static CMOS needs two per input. | 47.8 ("one switch per input"): the three input NMOS pulse in turn. 49.1 ("plus two"): the PMOS and the footer pulse. 50.8 ("two per input"): a ghost static NAND3 beside it (three PMOS in parallel, three NMOS in series) shows for 2 s; the count card fills: 3 inputs: static 6, dynamic 5. | NOTE "3 inputs: 6 vs 5" · on "plus two" (49.1) · out "Eight inputs" (52.1) · below right · tie arrow to the count card |
| **52.1-55.8 s** Eight inputs: sixteen switches static, just TEN dynamic. Fewer switches, faster. | Key state. 52.1 ("Eight inputs"): the stack grows to eight NMOS (drawn smaller); the count card row 8 lights: static 16, dynamic 10 (computed: 2 x 8 against 8 + 2). 54.8 ("Fewer switches"): the eight-input static ghost shows its eight extra PMOS in a row. 55.4 ("faster"): both evaluate once: the dynamic output drains first (fewer switches loading the inputs). The 16 vs 10 card stays lit through the next row (the longest hold). | PEN ring · on "just TEN dynamic" (53.8) · round 16 vs 10 on the count card · out "Perfect, right" (56.1) · key<br>NOTE "2 x 8 = 16, 8 + 2 = 10" · on "Eight inputs" (52.1) · out "Perfect, right" (56.1) · above left · tie none |
| **56.1-61.8 s** Perfect, right? Nope. Inputs can't change during evaluate. Once drained, it can't refill until the next clock. | 56.1 ("Perfect, right"): the 16 vs 10 card pulses. 56.8 ("Nope"): the card dims. 57.1 ("Inputs can't change"): the stack shrinks back to three; during evaluate C flips 1 then 0: the tank has already drained and stays empty (red dashed warning outline round it). 60.8 ("the next clock"): CLK to 0: the PMOS refills it. | NOTE "drained once = stuck at 0" · on "can't refill" (59.8) · out fold (65.4) · below left · tie arrow to the empty tank |
| **62.1-65.1 s** [thoughtful] Basically, refill first, drain if needed: that's dynamic logic. | 62.4 ("refill first"): one precharge and one evaluate replay, slowly. | NOTE "clock 0: fill, clock 1: drain" · on "refill first" (62.4) · out fold (65.4) · above left · tie arrow to the CLK lever |
| **65.4-73.6 s** [confident] Full first, so you never wait. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 65.4-67.0 fold back: the PMOS becomes the float valve, the output tank the cistern, the NMOS stack the three taps, CLK the flush handle (the start frame: a full cistern, counters at 0). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "precharge, then evaluate" · at end-4 (69.6) · out end · end card · tie box |

## Caption

8 inputs: 16 switches in static CMOS, 10 in dynamic logic.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
