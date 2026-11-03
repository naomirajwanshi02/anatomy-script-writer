```txt
[confident] You add two numbers, but each column adds THREE.

Three numbers? Let's watch.

[warmly] Add fifty-eight and sixty-seven. Eight plus seven: fifteen. Write five, carry one.

Next column: five, six, and the carried one. That's the third number. Twelve: write two, carry one.

So the carry could get huge, right? Nope. Nine plus nine plus one is nineteen.

[thoughtful] Three numbers in, a digit and a carry out. Let's understand this in episode twelve of chip design.

[pause] Now, the same with bits.

A bit is zero or one. So a column adds to three, tops.

Here's the catch. Bits have no two or three. Two is one zero. Three is one one.

Like paper. Write the last digit, carry the rest. The written bit, the sum? One for one or three. The carry? One for two or three.

That column? It's a circuit: a full adder. Line up four, each passing its carry left.

Watch six plus seven. [slightly excited] Third column: one, one, and a carry. THREE ones. Write one, carry one.

Out comes thirteen.

[thoughtful] Basically, three in, two out.

[confident] Every column, three in. Now you can explain what most engineers can't. Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 195 words (<code>check-voice.py</code>: PASS), about 65 s planned; voice speed about 1.05. Bits are said as words ("one zero", "one one"); keep them as written.

Times are planned (about 3 words per second, video 71.1 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] You add two numbers, but each column adds THREE. | Board lands (entrance): a sheet of squared paper on the board with 58 written over 67, a line under them, an empty answer row, and a small empty carry box above each column; a pencil with a rust tip (ROLLIN on its side, the one in-story ROLLIN) hovers over the paper, tapping lightly while the board lands. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.7 ("two numbers"): 58 and 67 pulse in turn. 1.7 ("each column"): both columns outline faintly. 2.7 ("THREE"): in the tens column three slots light one after another, top digit, bottom digit, then the carry box above, each with a small count 1, 2, 3 and a 20 % pop so it reads on a phone; then the counts fade and the paper is as it started (the start frame). | NOTE "3 per column, not 2" · on "You add two" (0.0) · out "Add fifty-eight" (4.9) · above right · tie arrow to the tens column · hook<br>PEN underline · on "THREE" (2.7) · under "3" · out "Add fifty-eight" (4.9) |
| **3.3-4.6 s** Three numbers? Let's watch. | The tens column's three slots pulse once. | Nothing new. |
| **4.9-8.9 s** [warmly] Add fifty-eight and sixty-seven. Eight plus seven: fifteen. Write five, carry one. | 4.9 ("Add fifty-eight"): the pencil taps 58, then 67. 6.2 ("Eight plus seven"): the units carry box shows a faint 0, then 8 glows, then 7. 7.2 ("fifteen"): readout beside the paper "15". 7.6 ("Write five"): the 5 drops into the answer row. 8.2 ("carry one"): the 1 hops in a rust arc into the carry box above the tens. | NOTE "8 + 7 + 0 = 15" · on "Eight plus seven" (6.2) · out "That's the third" (11.9) · above left · tie none<br>NOTE "the 1 hops to the tens" · on "carry one" (8.2) · out "That's the third" (11.9) · below left · tie arrow to the carry box above the tens |
| **9.2-14.9 s** Next column: five, six, and the carried one. That's the third number. Twelve: write two, carry one. | 9.2 ("Next"): the tens column highlights; 5, 6 and the carried 1 glow in turn. 11.9 ("That's the third number"): all three glow together. 13.2 ("Twelve"): readout "12". 13.5 ("write two"): 2 drops in. 14.2 ("carry one"): the 1 hops left and drops into the hundreds place: 125. | PEN ring · on "the third number" (12.2) · round the tens column's three numbers · out "So the carry" (15.2)<br>NOTE "5 + 6 + 1 = 12" · on "the third number" (12.2) · out "Nine plus nine" (17.9) · above right · tie none |
| **15.2-20.2 s** So the carry could get huge, right? Nope. Nine plus nine plus one is nineteen. | 15.2 ("So the carry"): the carry box pulses. 17.9 ("Nine plus nine"): a ghost column 9, 9 and a carried 1 fades in beside the sum. 19.9 ("nineteen"): its readout "19", the 1 hops into a carry box; the ghost fades. | NOTE "max: 9 + 9 + 1 = 19" · on "the carry could" (15.5) · out "Three numbers in" (20.5) · above left · tie none |
| **20.5-26.5 s** [thoughtful] Three numbers in, a digit and a carry out. Let's understand this in episode twelve of chip design. | 20.5 ("Three numbers in"): the tens column's three numbers pulse. 21.5 ("a digit and a carry out"): the written 2 and the carried 1 pulse. | NOTE "3 in → 1 digit + 1 carry" · on "a digit and" (21.5) · out "episode twelve" (24.8) · below centre · tie none<br>NOTE "Episode 12" · on "episode twelve" (24.8) · out end · top right · tie none · badge |
| **26.8-28.8 s** [pause] Now, the same with bits. | Fold: the paper's digits turn into four columns of bit tiles (row A on top, row B below; tiles and rust carry hops copied from <code>twos-complement</code>), the carry boxes become small carry-in tiles; one full-adder box rises under the right column. | Nothing new. |
| **29.1-33.4 s** A bit is zero or one. So a column adds to three, tops. | One box only. 29.1 ("A bit is"): its three inputs A, B, carry in show 0, 0, 0. 32.1 ("adds to three"): the inputs light one by one (rust), the readout counts 1, 2, 3, landing on "three". | NOTE "max 1 + 1 + 1 = 3" · on "A bit is" (29.1) · out "three is one one" (38.0) · above left · tie none |
| **33.7-39.4 s** Here's the catch. Bits have no two or three. Two is one zero. Three is one one. | 36.7 ("Two is one zero"): with two inputs lit, the readout shows "2 = 10". 38.0 ("three is one one"): with all three lit, "3 = 11". | NOTE "bits count: 0, 1, 10, 11" · on "Here's the catch" (33.7) · out "The written bit" (42.7) · above right · tie none<br>PEN ring · on "three is one one" (38.0) · round the readout "3 = 11" · out "carry the rest" (41.7) |
| **39.7-48.4 s** Like paper. Write the last digit, carry the rest. The written bit, the sum? One for one or three. The carry? One for two or three. | 40.4 ("Write the last"): from "11", the right digit drops through the box into the sum tile (lights). 41.7 ("carry the rest"): the front digit hops out of the box's left side into the carry-out tile, the same rust arc as on paper. 42.7 ("The written bit"): the inputs step 1 one (sum lit), 2 ones (sum dark), 3 ones (sum lit), one step per spoken number. 46.0 ("The carry? One"): the same steps for carry out: 1 one (dark), 2 (lit), 3 (lit). | NOTE "sum: total 1 or 3 (XOR)" · on "The written bit" (42.7) · out "That column" (48.7) · above left · tie arrow to the sum tile<br>NOTE "carry: total 2 or 3 (majority)" · on "The carry? One" (46.0) · out "a full adder" (50.4) · above right · tie arrow to the carry-out tile |
| **48.7-54.0 s** That column? It's a circuit: a full adder. Line up four, each passing its carry left. | 48.7 ("That column"): the box's pin labels engrave in: A, B (top), carry in (right), carry out (left), sum (bottom). 51.4 ("Line up four"): three more boxes rise under the other columns, right to left, joined by carry wires, with a printed "0" at the right box's carry in. 52.7 ("passing its carry left"): one rust dot runs the chain right to left. | NOTE "full = takes the carry too" · on "a full adder" (50.4) · out "Watch six" (54.3) · above left · tie arrow to the right adder box<br>PEN box · on "Line up four" (51.4) · round all four adders · out "Out comes" (60.3) |
| **54.3-60.0 s** Watch six plus seven. [slightly excited] Third column: one, one, and a carry. THREE ones. Write one, carry one. | 54.3 ("Watch six"): row A fills 0 1 1 0, then row B 0 1 1 1; the first two columns resolve quickly (sums 1, 0; a carry dot into column 3). Key state, hold about 4 s: 55.6 ("Third column"): box 3 highlights; its A, B, carry in pulse on "one, one, and a carry". 58.0 ("THREE ones"): all three glow together, readout "3 = 11". 58.6 ("Write one"): its sum tile lights. 59.3 ("carry one"): carry out lights and a dot runs into box 4. Computed in the model: one column-addition function for both halves (digit, digit, carry in → written digit, carry out); 58 + 67: (8, 7, 0 → 5, 1), (5, 6, 1 → 2, 1) = 125; 6 + 7 = 0110 + 0111: (0, 1, 0 → 1, 0), (1, 1, 0 → 0, 1), (1, 1, 1 → 1, 1), (0, 0, 1 → 1, 0) = 1101 = 13; for all 8 input rows sum = 1 for totals 1 or 3, carry = 1 for totals 2 or 3. | NOTE "6 + 7 = 0110 + 0111" · on "Watch six" (54.3) · out "Out comes" (60.3) · above right · tie arrow to the bit rows<br>PEN ring · on "THREE ones" (58.0) · round box 3's three inputs · out "Out comes" (60.3) · key |
| **60.3-61.3 s** Out comes thirteen. | Box 4 finishes (sum 1, carry out 0); the sum row 1 1 0 1 pulses once left to right. The figure prints no "13" (the note gives it). | NOTE "1101 = 8 + 4 + 1 = 13" · on "Out comes" (60.3) · out fold (63.6) · below centre · tie arrow to the sum row |
| **61.6-63.3 s** [thoughtful] Basically, three in, two out. | 61.6 ("Basically"): every box's three inputs pulse together, then its two outputs. | Nothing new. |
| **63.6-71.1 s** [confident] Every column, three in. Now you can explain what most engineers can't. Follow, and keep it that way. | 63.6-65.2 fold back to the paper: the bit tiles become 58 over 67 with an empty answer row and empty carry boxes (the start frame). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "each column: 3 in, 2 out" · at end-4 (67.1) · out end · end card · tie box |

## Caption

58 + 67: every column adds 3 numbers, and so does a full adder.

#chipdesign #vlsi #computerarchitecture #semiconductors #aihardware
