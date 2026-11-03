```txt
[confident] Two streams, but only your narrow one BREAKS through.

Same water in both. So why does only the narrow one break?

[warmly] See, in the narrow stream, the water squeezes through half the width. So it runs twice as fast, dragging sand.

Sand leaves the top and piles up lower down. In time, the top breaks through. The wide one? Barely moves.

[thoughtful] Squeezed water wears the sand away. Let's understand this in episode twenty-four of chip design.

[pause] Now, the same with bits.

The stream becomes a metal wire. The water becomes the current, electrons.

The sand becomes the wire's own metal atoms. Here's the weird part. Electrons rush through and push the atoms along.

Where atoms leave, a gap opens and the wire breaks. They pile up further on, a bump touching the next wire.

That's electromigration. It takes years, and chips must last years.

[slightly excited] Half the width, half the life, right? Nope. It breaks about FOUR times sooner.

The fix? Cap current per width, and widen busy wires.

[thoughtful] Basically, too much current breaks a narrow wire.

[confident] Same water, but the narrow one breaks.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 197 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. "Electromigration" is said as one word. Model numbers (scratch): crowding = current / width; wear rate goes with crowding squared (Black's law, exponent about 2), so half the width = 2x crowding = about 4x faster wear (life 1/4).

Times are planned (about 3 words per second, video 72.7 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Two streams, but only your narrow one BREAKS through. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>electromigration-stream</code>. A gentle sandy slope fills the board (tan sand, small grain dots), with a pond at the top left (blue water #2f6fb8, one ROLLIN maker's plate on its stone rim). Two channels run down the slope from the pond: a wide one (back) and a narrow one half its width (front), both ending in a small pool at the bottom. Two flow meters at the pond's outlets read the same number (same water in both). Below the board: one readout, "life", two bars (wide, narrow) on a 0-4 scale, both empty. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Two streams"): both channels flow. 1.7 ("narrow one"): the narrow channel's water runs visibly faster (longer streaks). 2.3 ("BREAKS through"): fast preview: sand streams down the narrow channel, a hollow eats into its top bank until the bank gives way and water spills out sideways; the bottom pool of the narrow channel goes dry; the wide channel is unchanged. Then the slope resets: both channels flowing, banks whole (the start frame). | NOTE "same pond, same water" · on "Two streams" (0.0) · out "the narrow stream" (8.3) · above right · tie arrow to the two flow meters · hook<br>PEN underline · on "BREAKS" (2.3) · under "same water" · out "the narrow stream" (8.3) |
| **3.3-7.3 s** Same water in both. So why does only the narrow one break? | 3.3 ("Same water"): the two flow meters pulse (same number). 5.6 ("only the narrow"): the narrow channel pulses. | PEN ring · on "only the narrow" (5.6) · round the narrow channel · out "So it runs" (11.9) |
| **7.6-11.6 s** [warmly] See, in the narrow stream, the water squeezes through half the width. | 8.3 ("the narrow stream"): the narrow channel outlines. 10.6 ("half the width"): a small width bracket on each channel: the narrow one half the wide one. | NOTE "same water, half the room" · on "half the width" (10.6) · out "dragging sand" (13.9) · above left · tie arrow to the width brackets |
| **11.9-14.6 s** So it runs twice as fast, dragging sand. | 12.9 ("twice as fast"): flow streaks in the narrow channel run twice the speed of the wide one's (computed: speed = flow / width). 13.9 ("dragging sand"): grains along the narrow channel's bed roll downstream; in the wide channel only a few twitch. | NOTE "speed = water / width" · on "twice as fast" (12.9) · out "Sand leaves" (14.9) · below left · tie arrow to the fast streaks |
| **14.9-19.9 s** Sand leaves the top and piles up lower down. In time, the top breaks through. | 14.9 ("Sand leaves"): a hollow forms at the top of the narrow channel, grains streaming out of it. 16.6 ("piles up"): grains collect into a sandbar further down. 19.2 ("breaks through"): the hollow eats through the top bank; water spills out sideways and the channel below runs dry. | NOTE "hole at the top, sandbar below" · on "piles up" (16.6) · out "The wide one" (20.2) · above right · tie arrow to the hollow |
| **20.2-21.9 s** The wide one? Barely moves. | 20.2 ("The wide one"): the wide channel pulses; its bed is still whole. The life readout fills: wide 4, narrow 1 (computed: life goes with 1 / crowding squared). | PEN tick · on "Barely moves" (21.2) · beside the wide channel · out fold (27.5) |
| **22.2-27.2 s** [thoughtful] Squeezed water wears the sand away. Let's understand this in episode twenty-four of chip design. | 22.2 ("Squeezed water"): the narrow channel's break replays once, slowly. Steady hold. | NOTE "Episode 24" · on "episode twenty-four" (25.5) · out end · top right · tie none · badge |
| **27.5-29.5 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics board (VDD rail at the back, GND rail at the front, both engraved). The pond becomes a driver gate (blue PMOS valve to VDD); the two channels become two metal wires to two output lamps, a wide wire (back) and a narrow wire, half as wide (front), each with a current meter reading the same value; a third wire runs close beside the narrow one (the neighbour). A round zoom window opens over the narrow wire: a neat grid of grey metal atoms (balls) with small rust electron dots streaming through the gaps. The life readout stays. | Nothing new. |
| **29.8-33.8 s** The stream becomes a metal wire. The water becomes the current, electrons. | 29.8 ("The stream becomes"): a ghost channel shows over the narrow wire and melts into it. 32.8 ("the current"): both current meters pulse (same value). 33.5 ("electrons"): the rust dots in the zoom window stream left to right. | NOTE "current = electrons flowing" · on "the current" (32.8) · out "own metal atoms" (35.8) · above left · tie arrow to the electron dots |
| **34.1-36.8 s** The sand becomes the wire's own metal atoms. | 34.1 ("The sand becomes"): a ghost sand grain melts into one atom in the window. 36.1 ("metal atoms"): the atom grid pulses. | NOTE "atoms = the wire itself" · on "metal atoms" (36.1) · out "push the atoms" (39.8) · above right · tie arrow to the atom grid |
| **37.1-41.1 s** Here's the weird part. Electrons rush through and push the atoms along. | 38.4 ("Electrons rush"): the electron dots speed up. 39.8 ("push the atoms"): one atom near the left of the window jiggles, then hops one place to the right; then another (the electron wind, computed rate from crowding). | NOTE "electron wind: tiny bumps add up" · on "push the atoms" (39.8) · out "a gap opens" (42.4) · below left · tie arrow to a hopping atom |
| **41.4-44.7 s** Where atoms leave, a gap opens and the wire breaks. | 41.4 ("Where atoms leave"): atoms leave the left part of the window one by one. 42.4 ("a gap opens"): a void grows across the wire's width. 43.7 ("the wire breaks"): the void spans the wire; the electron stream stops; the narrow wire's lamp goes out; its current meter drops to 0. | NOTE "void = open circuit" · on "a gap opens" (42.4) · out "the next wire" (47.7) · above left · tie arrow to the void |
| **45.0-48.7 s** They pile up further on, a bump touching the next wire. | 45.0 ("They pile up"): the moved atoms pile into a bump on the right of the window. 47.3 ("touching the next wire"): the bump grows sideways until it touches the neighbour wire; a red dashed warning outline (stroke 4.5, dash 10 6) rings the contact. | NOTE "hillock = short to a neighbour" · on "touching the next" (47.3) · out "must last years" (51.3) · below right · tie arrow to the bump |
| **49.0-52.3 s** That's electromigration. It takes years, and chips must last years. | 49.0 ("That's electromigration"): the window resets; the whole sequence replays at high speed under a small time tag counting years 0 to 10 (state tag). 51.3 ("must last years"): the time tag pulses. | NOTE "slow, but never stops" · on "That's electromigration" (49.0) · out "FOUR times" (56.3) · above right · tie arrow to the time tag |
| **52.6-57.3 s** [slightly excited] Half the width, half the life, right? Nope. It breaks about FOUR times sooner. | Key state. 52.6 ("Half the width"): width brackets on both wires, the narrow one half the wide one; electron dots in the narrow wire drawn twice as dense as in the wide one (zoom windows on both). 53.6 ("half the life"): a ghost life bar at 2 (half of 4) shows for the narrow wire. 54.9 ("Nope"): the ghost bar dims. 56.3 ("FOUR times sooner"): both wires run their wear at once under the year tag: the narrow wire's void opens at 2.5 years, the wide wire's at 10; the life bars read narrow 1, wide 4 (computed: life = 1 / crowding squared). The two life bars, 1 and 4, hold through the next row (the longest hold). | PEN ring · on "FOUR times" (56.3) · round the two life bars · out "Cap current" (58.3) · key<br>NOTE "2 x crowding = 1/4 life" · on "Half the width" (52.6) · out "Cap current" (58.3) · below left · tie arrow to the narrow wire's window |
| **57.6-60.9 s** The fix? Cap current per width, and widen busy wires. | 58.3 ("Cap current"): a rule plate "max current per width" engraves under the wires. 59.9 ("widen busy wires"): the narrow wire widens to match the wide one; its life bar grows to 4. | NOTE "the rule: current / width < max" · on "Cap current" (58.3) · out fold (64.2) · above left · tie arrow to the rule plate |
| **61.2-63.9 s** [thoughtful] Basically, too much current breaks a narrow wire. | 61.5 ("Too much current"): the narrow wire's void replays once, then a ghost of the broken channel beside it for 1.5 s. | Nothing new. |
| **64.2-72.7 s** [confident] Same water, but the narrow one breaks. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 64.2-65.8 fold back: the wires become the two channels, the electrons water, the atoms sand, the driver the pond; the readout clears (the start frame: both channels flowing, banks whole). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "keep current per width low" · at end-4 (68.7) · out end · end card · tie box |

## Caption

Half the wire width, about 4 times faster wear: electromigration.

#chipdesign #vlsi #semiconductors #aihardware #computerarchitecture
