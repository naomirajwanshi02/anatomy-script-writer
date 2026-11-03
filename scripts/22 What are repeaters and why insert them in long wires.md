```txt
[confident] How many taps fill your long tray FASTEST?

More taps, more speed, right? Let's watch.

[warmly] See, one tap fills a long ice tray, cup by cup.

The far cup waits a hundred and three ticks.

Now add a refill tap after every cup. Each opens when its cup is half full.

Fastest, right? Nope. Each tap takes five ticks to open. Eighty-six ticks.

Here's the trick. One tap every four cups. Each short run takes about eight ticks, each tap five more. Forty-five ticks.

[thoughtful] Not too few taps, not too many. Let's understand this in episode twenty-two of chip design.

[pause] Now, the same with bits.

Your chip has the same problem: a sixteen-piece wire.

So alone, the far end waits a hundred and three ticks.

Each refill tap becomes a repeater: two small inverters.

At half full, it drives the next pieces from the supply.

One every piece? Eighty-six ticks.

[slightly excited] One every four: forty-five ticks, under HALF.

Double the wire: alone, four times slower. Repeaters? About twice.

[thoughtful] Basically, repeaters make wire delay grow with length, not length times length.

[confident] So how many taps? One every four.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 67 s planned; voice speed about 1.05. Say "a hundred and three" and "forty-five" as numbers. Model numbers (scratch simulation, 21's ladder: r = 1, c = 1 per piece, far end flips at half full, tap or repeater delay 5 ticks): 16 pieces 103.0; 4 runs of 4 = 4 x 7.5 + 3 x 5 = 45.1; a repeater after every piece = 16 x 0.7 + 15 x 5 = 86.1 (every 2 pieces: 52.8); 32 pieces 399.9 alone, 95.3 with a repeater every 4.

Times are planned (about 3 words per second, video 73.6 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] How many taps fill your long tray FASTEST? | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>repeater-icetray</code>, copied from 21's <code>wire-rc-icetray</code>. On the left, the water tank on a stand (blue water #2f6fb8, fixed level, one ROLLIN maker's plate on it) with a main pipe running along the back edge of the board. Two identical single-row isometric ice trays of 16 cups side by side: the back tray has only its tap from the tank into cup 1 (the 1-tap reference); the front tray has the same tap, and refill taps hanging from the main pipe can slide in over any cup from 2 to 16, each worked by a float on a short rod resting in the cup before it. Every cup wall has a small V notch; each far cup has a thin fill line at half height. Below the board, three Oxanium tick timers, "1 tap", "tap every cup" and "tap every 4 cups", each a bar on a scale 0 to 103, empty, each with a small "?" (the start frame's question). Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("How many taps"): ghost refill taps pop in over the front tray, 1, then 3, then 15, a small count tag beside them, and fade. 1.3 ("your long tray"): the front tray pulses. 2.3 ("FASTEST"): the three empty timer bars pulse with their "?". | NOTE "1 tap? 3? 15?" · on "How many taps" (0.0) · out "one tap fills" (5.9) · above right · tie arrow to the front tray · hook |
| **3.0-5.3 s** More taps, more speed, right? Let's watch. | 3.0 ("More taps"): refill taps slide in over the front tray one by one to 15, then slide back out. 4.7 ("Let's watch"): the timer bars pulse once. | PEN ring · on "more speed" (3.7) · round the three timer bars · out "one tap fills" (5.9) |
| **5.6-9.3 s** [warmly] See, one tap fills a long ice tray, cup by cup. | 5.9 ("one tap fills"): the back tray's tap opens (slow, 0.15 s per tick); water fills cup 1. 8.3 ("cup by cup"): cup 1 spills through its notch into cup 2, then cup 3, each a little lower than the one before (computed: flow through each notch = level difference). | NOTE "flow = level difference" · on "cup by cup" (8.3) · out "a hundred" (10.9) · above left · tie arrow to the notch between cups 2 and 3 |
| **9.6-12.6 s** The far cup waits a hundred and three ticks. | 9.6 ("The far cup"): the back tray speeds up (0.04 s per tick); its far cup outlines. 10.9 ("a hundred and three"): the far cup reaches its line; the "1 tap" timer stops at 103. | NOTE "16 cups, 1 tap: 103 ticks" · on "a hundred and three" (10.9) · out "five ticks to open" (20.5) · right of the timers · tie arrow to the 1 tap timer |
| **12.9-18.2 s** Now add a refill tap after every cup. Each opens when its cup is half full. | 14.6 ("after every cup"): fifteen refill taps with their floats slide in over the front tray, one over each cup from 2 to 16. 15.6 ("Each opens"): the first float, resting in cup 1, outlines. 17.6 ("half full"): a dashed half mark appears on cup 1. Then the front tray's tap opens; at half full in cup 1 the float lifts and the first refill tap opens into cup 2 with a full fresh stream from the main pipe (computed). | PEN box · on "after every cup" (14.6) · round the front tray's fifteen taps · out "One tap every four" (23.8)<br>NOTE "float lifts at half full" · on "half full" (17.6) · out "five ticks" (20.5) · outside the box · tie box |
| **18.5-22.5 s** Fastest, right? Nope. Each tap takes five ticks to open. Eighty-six ticks. | 18.5 ("Fastest, right"): the run continues cup by cup, each float lifting its tap in turn; the "tap every cup" timer counts (0.04 s per tick). 19.2 ("Nope"): the timer is still counting. 20.5 ("five ticks to open"): each tap flashes "5" as it opens. 21.8 ("Eighty-six ticks"): the front tray's far cup reaches its line; the timer stops at 86 beside the 103 (computed: 16 x 0.7 + 15 x 5 = 86.1). | NOTE "15 taps x 5 = 75 ticks of waiting" · on "Eighty-six ticks" (21.8) · out "One tap every four" (23.8) · below centre · tie arrow to the 86 timer |
| **22.8-29.8 s** Here's the trick. One tap every four cups. Each short run takes about eight ticks, each tap five more. Forty-five ticks. | 23.8 ("One tap every four"): the water drains; twelve taps slide out, leaving taps over cups 5, 9 and 13; thin ink marks split the front tray into four runs of four. 25.5 ("Each short run"): the front tray's tap opens; the runs fill one after another, each float opening the next tap; the "tap every 4 cups" timer counts (0.04 s per tick). 26.8 ("about eight"): each run's fill flashes "8" for 0.5 s. 27.8 ("each tap five"): each tap's opening delay flashes "5". 29.1 ("Forty-five ticks"): the front tray's far cup reaches its line; the timer stops at 45 beside the 103 and the 86. | NOTE "4 runs x 7.5 + 3 taps x 5 = 45" · on "about eight" (26.8) · out "Not too few" (30.1) · below centre · tie none |
| **30.1-35.4 s** [thoughtful] Not too few taps, not too many. Let's understand this in episode twenty-two of chip design. | 30.1 ("Not too few"): the three timer bars, 103, 86 and 45, pulse in turn. Steady hold: both trays full. | NOTE "too few or too many: slow" · on "Not too few" (30.1) · out fold (35.7) · above left · tie arrow to the three timers<br>NOTE "Episode 22" · on "episode twenty-two" (33.8) · out end · top right · tie none · badge |
| **35.7-37.7 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the water drains; the tank becomes a gate block (a blue PMOS valve to a VDD rail at the back, a red NMOS valve to a GND rail at the front) with an input lever on its left, at 0; each tray becomes a long thin wire of 16 pieces, each piece a small zig-zag resistor plus a small glass tank of charge hanging to the GND rail (21's wire); the back wire has no repeaters; on the front wire the three refill taps become three repeater blocks, each two small inverter blocks (blue PMOS over red NMOS) between the rails, splitting the wire into four runs of four pieces. Each wire's far end gets a state tag "0". The timers become three tick bars, "no repeaters", "every piece" and "every 4 pieces", scale 0 to 103, empty. | Nothing new. |
| **38.0-41.0 s** Your chip has the same problem: a sixteen-piece wire. | 39.0 ("the same problem"): a ghost ice tray shows over the back wire for 1.5 s and melts into it. 40.3 ("sixteen-piece wire"): thin ink ticks divide the back wire into its 16 pieces; one piece (one resistor plus one tank) outlines. | NOTE "piece = 1 resistor + 1 tank" · on "sixteen-piece wire" (40.3) · out "Each refill tap" (45.3) · above left · tie arrow to one wire piece |
| **41.3-45.0 s** So alone, the far end waits a hundred and three ticks. | 41.6 ("alone"): the lever goes 0 to 1; rust charge spreads along the back wire piece by piece, each tank a little lower than the one before; the "no repeaters" bar counts. 43.3 ("a hundred and three"): the last tank reaches its half line, the far-end tag flips to 1, the bar stops at 103. | PEN ring · on "a hundred and three" (43.3) · round the 103 bar · out "Each refill tap" (45.3) |
| **45.3-48.3 s** Each refill tap becomes a repeater: two small inverters. | 45.3 ("Each refill tap"): a ghost refill tap shows over the first repeater block and melts into it. 46.6 ("a repeater"): the three repeater blocks pulse in turn. 47.3 ("two small inverters"): the first repeater's two inverter blocks light in turn, blue and red gate bars. | NOTE "buffer = 2 inverters, same bit" · on "two small inverters" (47.3) · out "the next pieces" (50.3) · above right · tie arrow to the first repeater |
| **48.6-52.3 s** At half full, it drives the next pieces from the supply. | 48.6 ("At half full"): the lever resets to 0 and the wires drain; the lever goes 0 to 1 for the front wire; charge spreads along run 1. The tank before repeater 1 reaches its half line; repeater 1's first inverter flips (gate bars swap). 49.9 ("drives the next"): 5 ticks later its second inverter flips and a solid rust strap runs from the VDD rail through its PMOS into run 2. 51.3 ("from the supply"): the VDD rail pulses above repeater 1. | NOTE "VDD refills it, not the wire" · on "from the supply" (51.3) · out "One every four" (54.6) · above right · tie arrow to the VDD strap |
| **52.6-54.3 s** One every piece? Eighty-six ticks. | 52.6 ("One every piece"): the front wire drains; twelve more repeaters slide in, one after every piece; the lever goes 0 to 1 and each repeater flashes "5" as it fires. 53.6 ("Eighty-six ticks"): the far end flips at 86; the "every piece" bar stops at 86 (computed: 16 x 0.7 + 15 x 5 = 86.1). Then the twelve extra repeaters slide out again. | NOTE "15 repeaters x 5 = 75 of waiting" · on "Eighty-six ticks" (53.6) · out "Double the wire" (57.2) · below centre · tie arrow to the 86 bar |
| **54.6-56.9 s** [slightly excited] One every four: forty-five ticks, under HALF. | Key state. 54.6 ("One every four"): the lever goes 0 to 1 again; repeaters 1, 2 and 3 fire in turn (computed, 5 ticks each). 55.6 ("forty-five ticks"): the front wire's far end flips at 45; the "every 4 pieces" bar stops at 45 beside 103 and 86. 56.3 ("under HALF"): a ghost half mark at 51.5 on the 103 bar; the 45 bar stops short of it. Computed in the model: the same ladder as episode 21 (r = 1, c = 1 per piece, far end flips at half full), each repeater a fixed 5-tick delay that then drives its run from VDD: 16 pieces 103.0; 4 runs of 4: 45.1; a repeater after every piece: 86.1. The three bars stay on screen through the next row (the longest hold). | PEN ring · on "under HALF" (56.3) · round the 45 bar · out "Basically" (60.8) · key<br>NOTE "103 → 45 ticks" · on "forty-five ticks" (55.6) · out "four times slower" (58.5) · right of the readouts · tie arrow to the 45 bar |
| **57.2-60.5 s** Double the wire: alone, four times slower. Repeaters? About twice. | 57.2 ("Double the wire"): both wires stretch to 32 pieces (drawn at half scale), the front wire with seven repeaters, one every four pieces; the bars' scale changes to 0-400. 58.5 ("four times slower"): the back wire charges; its bar stops at 400 (computed 399.9). 59.9 ("about twice"): the front wire's bar stops at 95 (computed 95.3), about twice its old 45. Then both wires shrink back to 16 pieces. | NOTE "alone: 103 → 400" · on "four times slower" (58.5) · out "Basically" (60.8) · above left · tie arrow to the 400 bar<br>NOTE "repeaters: 45 → 95" · on "about twice" (59.9) · out fold (65.1) · below right · tie arrow to the 95 bar |
| **60.8-64.8 s** [thoughtful] Basically, repeaters make wire delay grow with length, not length times length. | 60.8 ("Basically"): the three repeater blocks pulse together. 63.8 ("length times length"): a faint ghost of the 400 bar beside the 95 bar for 1.5 s. | NOTE "length x 2 = delay x 2" · on "wire delay" (61.8) · out fold (65.1) · above centre · tie none |
| **65.1-73.6 s** [confident] So how many taps? One every four. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 65.1-66.7 fold back: the lever returns to 0 and both wires drain; the gate becomes the tank, the resistors notches, the charge tanks cups, the repeaters refill taps with their floats (slid out again), the wires the two ice trays; the readouts become the three empty timers with their "?" (the start frame). 66.4 ("One every four"): three ghost taps over cups 5, 9 and 13 show for 1 s. Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "one repeater every few pieces" · at end-4 (69.6) · out end · end card · tie box |

## Caption

A 16-piece wire: 103 ticks alone, 45 with 3 repeaters. Here is why.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
