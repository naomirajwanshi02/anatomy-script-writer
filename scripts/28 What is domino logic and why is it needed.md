```txt
[confident] Your ten dominoes fall, but NEVER stand back up.

So why would a chip want gates that only fall?

[warmly] See, stand ten dominoes in a row. Push the first: each knocks the next, one way.

Once fallen, none can rise until you reset the row.

Now lean each domino on the next. It topples before any push.

[thoughtful] Every domino starts standing and falls one way. Let's understand this in episode twenty-eight of chip design.

[pause] Now, the same with bits.

A dynamic gate fills its output to one, then may drain it.

Feed that output straight into a second dynamic gate.

Here's the weird part. At evaluate's start, the first output is still one. So the second drains at once.

Then the first drains: its answer was zero. The second refills, right? Nope. Stuck, wrong.

[slightly excited] The fix? An inverter after each gate. Now every output starts at ZERO, standing.

Each output can only rise to one, once, like a falling domino.

Each output knocks the next gate, domino by domino.

[thoughtful] Basically, that's domino logic: dynamic gates plus inverters.

[confident] Start standing, fall once, like your dominoes.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 198 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. Model (scratch): two dynamic gates sharing one clock. Without inverters: gate 2's input = gate 1's output, which is 1 (precharged) at the start of evaluate, so gate 2 discharges before gate 1 settles; when gate 1's true output is 0, gate 2 ends at 0 and cannot recover: wrong. With an inverter after each dynamic gate: every stage output is 0 during precharge and can only rise during evaluate (monotonic), so each stage evaluates only once its input has truly risen.

Times are planned (about 3 words per second, video 72.3 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Your ten dominoes fall, but NEVER stand back up. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>domino-logic</code>. Ten isometric dominoes stand in a row on the board (cream faces, black pips, numbered 1-10 on the side; one ROLLIN maker's stamp on domino 1's face). A flat 2D hand (side profile, soft ground shadow) at the left. Below the board: one readout, "fallen", ten small squares that fill in rust. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Your ten dominoes"): the hand pushes domino 1; the row falls left to right, each square filling as its domino falls. 1.7 ("NEVER stand back up"): the fallen row stays down; the hand lifts one domino a little and lets go: it falls back. Then the hand resets the row (the start frame). | NOTE "one push, all ten" · on "ten dominoes fall" (0.3) · out "stand ten" (7.2) · above right · tie arrow to the falling row · hook |
| **3.3-6.6 s** So why would a chip want gates that only fall? | 4.3 ("a chip"): the row pulses. 6.0 ("only fall"): domino 1 tips a little and back. Then the fallen squares clear. | PEN ring · on "only fall" (6.0) · round domino 1 · out "stand ten" (7.2) |
| **6.9-12.2 s** [warmly] See, stand ten dominoes in a row. Push the first: each knocks the next, one way. | 7.2 ("stand ten dominoes"): the dominoes pulse in turn. 9.2 ("Push the first"): the hand pushes domino 1; each knocks the next, left to right. 11.6 ("one way"): a small arrow of dust puffs runs along the row, left to right. | NOTE "falls only after the one before" · on "knocks the next" (10.6) · out "reset the row" (14.8) · above left · tie arrow to the falling row |
| **12.5-15.8 s** Once fallen, none can rise until you reset the row. | 12.5 ("Once fallen"): the row lies flat. 13.2 ("none can rise"): domino 5 rocks but stays down. 14.8 ("reset the row"): the hand stands all ten back up (reset). | NOTE "reset = every round" · on "reset the row" (14.8) · out "It topples" (18.4) · below left · tie arrow to the hand |
| **16.1-20.1 s** Now lean each domino on the next. It topples before any push. | 16.4 ("lean each domino"): each domino tilts until it rests on the next. 18.8 ("topples before"): domino 1 slips and the whole row falls on its own, the hand still far away; red dashed warning outline round the row (computed: each leaning domino already pushes its neighbour at the start). | NOTE "already pushing at the start" · on "lean each domino" (16.4) · out "episode twenty-eight" (24.4) · above right · tie arrow to the leaning row |
| **20.4-26.1 s** [thoughtful] Every domino starts standing and falls one way. Let's understand this in episode twenty-eight of chip design. | 20.4 ("Every domino starts standing"): the hand resets the row upright; the warning outline fades. 22.1 ("falls one way"): one clean push, the row falls left to right. Steady hold. | PEN tick · on "Every domino starts" (20.4) · beside the upright row · out fold (26.4)<br>NOTE "Episode 28" · on "episode twenty-eight" (24.4) · out end · top right · tie none · badge |
| **26.4-28.4 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics CMOS board (VDD rail at the back, GND rail at the front, both engraved), one clock lever (CLK) on the left. Two dynamic gates side by side (as in episode 27, drawn smaller): each a blue PMOS precharge valve from VDD to an output node with a glass output tank, a red NMOS input stack below and a footer NMOS on CLK to GND; gate 1 has input levers A and B; gate 1's output wire runs straight into gate 2's input NMOS (gate 2's other input is a flat label C = 1). Output lamps on both. Below the board: a DE-style timing graph, three rows: CLK, out 1, out 2. | Nothing new. |
| **28.7-32.7 s** A dynamic gate fills its output to one, then may drain it. | 29.7 ("fills its output"): CLK 0: gate 1's PMOS lights blue and its tank fills; out 1 = 1 on the graph. 31.7 ("may drain it"): CLK 1 with A = B = 1: gate 1 drains; out 1 falls to 0 (computed). CLK back to 0: refilled. | NOTE "precharge 1, then maybe 0" · on "fills its output" (29.7) · out "a second dynamic" (34.7) · above left · tie arrow to gate 1's tank |
| **33.0-36.0 s** Feed that output straight into a second dynamic gate. | 33.0 ("Feed that output"): the wire from gate 1's output to gate 2's input NMOS flashes. 34.7 ("a second dynamic gate"): gate 2 pulses; its tank is full (precharged). | PEN arrow · on "Feed that output" (33.0) · to the wire into gate 2 · out "drains at once" (41.6) |
| **36.3-42.6 s** Here's the weird part. At evaluate's start, the first output is still one. So the second drains at once. | 38.0 ("evaluate's start"): CLK to 1 with A = B = 1 (gate 1's answer will be 0). 40.0 ("still one"): out 1 is still 1 for the first moment (gate 1's tank still full). 41.6 ("drains at once"): gate 2's input NMOS lights at once and its tank drains; out 2 falls on the graph before out 1 does (computed). | NOTE "one clock: both evaluate together" · on "evaluate's start" (38.0) · out "drains at once" (41.6) · above left · tie arrow to the CLK lever<br>NOTE "out 1 is still 1 here" · on "still one" (40.0) · out "Stuck, wrong" (47.2) · above right · tie arrow to out 1 on the graph<br>NOTE "gate 2 empties too soon" · on "drains at once" (41.6) · out "An inverter after" (48.9) · below right · tie arrow to gate 2's tank |
| **42.9-47.9 s** Then the first drains: its answer was zero. The second refills, right? Nope. Stuck, wrong. | 43.2 ("the first drains"): gate 1's tank empties a moment later; out 1 falls to 0. 44.2 ("its answer was zero"): so gate 2 should have stayed full (its input is 0). 45.6 ("the second refills"): a ghost full line shows on gate 2's tank, then fades. 47.2 ("Stuck, wrong"): gate 2's tank stays empty until the next precharge; out 2 = 0 (wrong); red dashed warning outline round gate 2's tank. | NOTE "out 2 should stay 1" · on "its answer was" (44.2) · out "An inverter after" (48.9) · below left · tie arrow to gate 2's empty tank |
| **48.2-52.9 s** [slightly excited] The fix? An inverter after each gate. Now every output starts at ZERO, standing. | Key state. 48.2 ("The fix"): CLK to 0; a small static inverter block (blue over red) drops in after each dynamic gate; gate 2 now reads gate 1's inverted output. 51.5 ("starts at ZERO"): during precharge both inverted outputs read 0 (lamps dark); the graph rows read out 1 = 0, out 2 = 0. 52.5 ("standing"): a ghost standing domino beside each inverter. The two dark lamps and the 0 rows hold through the next row (the longest hold). | PEN ring · on "starts at ZERO" (51.5) · round the two dark output lamps · out "domino by domino" (59.5) · key<br>NOTE "dynamic gate + inverter" · on "An inverter after" (48.9) · out "only rise" (54.2) · above left · tie arrow to the first inverter |
| **53.2-57.2 s** Each output can only rise to one, once, like a falling domino. | 54.2 ("only rise"): CLK to 1, A = B = 1: gate 1's tank drains, so its inverted output rises 0 to 1 (graph). 55.9 ("like a falling domino"): a ghost domino falls beside it. | NOTE "0 → 1 only, once per clock" · on "only rise" (54.2) · out "domino by domino" (59.5) · above right · tie arrow to out 1 on the graph |
| **57.5-60.5 s** Each output knocks the next gate, domino by domino. | 58.2 ("knocks the next gate"): only now gate 2's input NMOS lights; gate 2 drains and its inverted output rises 0 to 1 (computed, after out 1). 59.5 ("domino by domino"): the graph shows out 1 rising, then out 2. | NOTE "each waits for a real 1" · on "knocks the next" (58.2) · out fold (63.8) · below centre · tie arrow to out 2 on the graph |
| **60.8-63.5 s** [thoughtful] Basically, that's domino logic: dynamic gates plus inverters. | 61.5 ("domino logic"): both stages, each a dynamic gate plus its inverter, pulse together. | Nothing new. |
| **63.8-72.3 s** [confident] Start standing, fall once, like your dominoes. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 63.8-65.4 fold back: the gates and inverters fold back into the ten standing dominoes; the graph becomes the fallen squares, clear (the start frame). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "outputs start at 0, rise once" · at end-4 (68.3) · out end · end card · tie box |

## Caption

1 inverter per gate stops dynamic logic from draining by mistake.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
