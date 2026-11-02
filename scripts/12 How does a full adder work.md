```txt
[confident] You add two numbers, but each column adds THREE.

Three numbers? Let's watch.

[warmly] Add fifty-eight and sixty-seven. No carry yet. Eight plus seven: fifteen. Write five, carry one.

Next: five, six, and the carried one. That's the third number. Twelve: write two, carry one.

The carry is never more than one. Nine plus nine plus one is nineteen.

[thoughtful] Three numbers in, a digit and a carry out. Let's understand this in episode twelve of chip design.

[pause] Now, the same with bits.

A bit is zero or one. So a column adds to three at most.

But bits have no two or three. Two is one zero, three is one one.

Write the last digit, carry the rest, like paper. The written bit, the sum, is one for one or three. The carry is one for two or three.

That column becomes a circuit: a full adder. Line up four, each passing its carry left.

Watch six plus seven. [slightly excited] Third column: one, one, and a carry. THREE ones. Write one, carry one.

Out comes thirteen.

[thoughtful] Same as paper: three in, two out.

[curious] Three bits count zero to seven. How do three wires pick one of eight doorbells? That's episode thirteen.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 199 words (<code>check-voice.py</code>: PASS), about 71 s planned; voice speed about 1.05. Bits are said as words ("one zero", "one one"); keep them as written.

Times are planned (about 3 words per second, video 71.3 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] You add two numbers, but each column adds THREE. | Board lands (entrance): a sheet of squared paper on the board with 58 written over 67, a line under them, an empty answer row, and a small empty carry box above each column; a pencil with a rust tip (ROLLIN on its side, the one in-story ROLLIN). Visual hook: 0.8 ("two numbers"): 58 and 67 pulse in turn. 1.8 ("each column"): both columns outline faintly. 2.4 ("THREE"): the tens column shows three slots: top digit, bottom digit and the carry box above. | NOTE "2 digits + 1 carry" · on "each column" (1.8) · out "Add fifty-eight" (4.3) · above right · tie arrow to the tens column · hook |
| **3.0-4.3 s** Three numbers? Let's watch. | The tens column's three slots pulse once. | Nothing new. |
| **4.3-9.1 s** [warmly] Add fifty-eight and sixty-seven. No carry yet. Eight plus seven: fifteen. Write five, carry one. | 4.3 ("Add fifty-eight"): the pencil taps 58, then 67. 5.4 ("No carry yet"): the units carry box shows a faint 0, then 8 glows, then 7. 6.6 ("fifteen"): readout beside the paper "15". 7.0 ("Write five"): the 5 drops into the answer row. 8.0 ("carry one"): the 1 hops in a rust arc into the carry box above the tens. | NOTE "8 + 7 + 0 = 15" · on "No carry yet" (5.4) · out "That's the third" (11.7) · above left · tie none<br />PEN arrow · on "carry one" (8.0) · to the carry box above the tens · out "Next" (9.1) |
| **9.1-15.0 s** Next: five, six, and the carried one. That's the third number. Twelve: write two, carry one. | 9.1 ("Next"): the tens column highlights; 5, 6 and the carried 1 glow in turn. 11.7 ("That's the third number"): all three glow together. 12.3 ("Twelve"): readout "12". 13.0 ("write two"): 2 drops in. 13.6 ("carry one"): the 1 hops left and drops into the hundreds place: 125. | PEN ring · on "the third number" (11.7) · round the tens column's three numbers · out "The carry is" (15.0)<br />NOTE "5 + 6 + 1 = 12" · on "the third number" (11.9) · out "Nine plus nine" (17.5) · above right · tie none |
| **15.0-20.1 s** The carry is never more than one. Nine plus nine plus one is nineteen. | 15.0 ("The carry is"): the carry box pulses. 17.5 ("Nine plus nine"): a ghost column 9, 9 and a carried 1 fades in beside the sum. 19.5 ("nineteen"): its readout "19", the 1 hops into a carry box; the ghost fades. | NOTE "max: 9 + 9 + 1 = 19" · on "The carry is" (15.0) · out "Three numbers in" (20.1) · above left · tie none |
| **20.1-26.3 s** [thoughtful] Three numbers in, a digit and a carry out. Let's understand this in episode twelve of chip design. | 20.1 ("Three numbers in"): the tens column's three numbers pulse. 21.5 ("a digit and a carry out"): the written 2 and the carried 1 pulse. | NOTE "3 in → 1 digit + 1 carry" · on "a digit and" (21.5) · out "episode twelve" (24.3) · below centre · tie none<br />NOTE "Episode 12" · on "episode twelve" (24.3) · out end · top right · tie none · badge |
| **26.3-27.3 s** [pause] Now, the same with bits. | Fold: the paper's digits turn into four columns of bit tiles (row A on top, row B below; tiles and rust carry hops copied from <code>twos-complement</code>), the carry boxes become small carry-in tiles; one full-adder box rises under the right column. | Nothing new. |
| **27.3-31.8 s** A bit is zero or one. So a column adds to three at most. | One box only. 27.3 ("A bit is"): its three inputs A, B, carry in show 0, 0, 0. 28.9-30.8 ("adds to three"): the inputs light one by one (rust), the readout counts 1, 2, 3, landing on "three". | NOTE "max 1 + 1 + 1 = 3" · on "A bit is" (27.3) · out "three is one one" (33.8) · above left · tie none |
| **31.8-35.4 s** But bits have no two or three. Two is one zero, three is one one. | 32.5 ("Two is one zero"): with two inputs lit, the readout shows "2 = 10". 33.8 ("three is one one"): with all three lit, "3 = 11". | NOTE "bits count: 0, 1, 10, 11" · on "But bits" (31.8) · out "The written bit" (39.0) · above right · tie none<br />PEN ring · on "three is one one" (33.8) · round the readout "3 = 11" · out "carry the rest" (36.7) |
| **35.4-46.1 s** Write the last digit, carry the rest, like paper. The written bit, the sum, is one for one or three. The carry is one for two or three. | 35.4 ("Write the last"): from "11", the right digit drops through the box into the sum tile (lights). 36.7 ("carry the rest"): the front digit hops out of the box's left side into the carry-out tile, the same rust arc as on paper. 39.0 ("The written bit"): the inputs step 1 one (sum lit), 2 ones (sum dark), 3 ones (sum lit), one step per spoken number. 42.8 ("The carry is one"): the same steps for carry out: 1 one (dark), 2 (lit), 3 (lit). | NOTE "sum: total 1 or 3 (XOR)" · on "The written bit" (39.0) · out "That column becomes" (46.1) · above left · tie arrow to the sum tile<br />NOTE "carry: total 2 or 3 (majority)" · on "The carry is one" (42.8) · out "a full adder" (48.0) · above right · tie arrow to the carry-out tile |
| **46.1-51.9 s** That column becomes a circuit: a full adder. Line up four, each passing its carry left. | 46.1 ("That column becomes"): the box's pin labels engrave in: A, B (top), carry in (right), carry out (left), sum (bottom). 49.0 ("Line up four"): three more boxes rise under the other columns, right to left, joined by carry wires, with a printed "0" at the right box's carry in. 50.3 ("passing its carry left"): one rust dot runs the chain right to left. | NOTE "full = takes the carry too" · on "a full adder" (48.0) · out "Watch six" (51.9) · above left · tie arrow to the right adder box<br />PEN box · on "Line up four" (49.0) · round all four adders · out "Out comes" (58.4) |
| **51.9-58.4 s** Watch six plus seven. [slightly excited] Third column: one, one, and a carry. THREE ones. Write one, carry one. | 51.9 ("Watch six"): row A fills 0 1 1 0, then row B 0 1 1 1; the first two columns resolve quickly (sums 1, 0; a carry dot into column 3). Key state, hold about 4 s: 53.2 ("Third column"): box 3 highlights; its A, B, carry in pulse on "one, one, and a carry". 56.1 ("THREE ones"): all three glow together, readout "3 = 11". 56.8 ("Write one"): its sum tile lights. 57.6 ("carry one"): carry out lights and a dot runs into box 4. Computed in the model: one column-addition function for both halves (digit, digit, carry in → written digit, carry out); 58 + 67: (8, 7, 0 → 5, 1), (5, 6, 1 → 2, 1) = 125; 6 + 7 = 0110 + 0111: (0, 1, 0 → 1, 0), (1, 1, 0 → 0, 1), (1, 1, 1 → 1, 1), (0, 0, 1 → 1, 0) = 1101 = 13; for all 8 input rows sum = 1 for totals 1 or 3, carry = 1 for totals 2 or 3. | NOTE "6 + 7 = 0110 + 0111" · on "Watch six" (51.9) · out "Out comes" (58.4) · above right · tie arrow to the bit rows<br />PEN ring · on "THREE ones" (56.1) · round box 3's three inputs · out "Out comes" (58.4) · key |
| **58.4-59.7 s** Out comes thirteen. | Box 4 finishes (sum 1, carry out 0); the sum row 1 1 0 1 pulses once left to right. The figure prints no "13" (the note gives it). | NOTE "1101 = 8 + 4 + 1 = 13" · on "Out comes" (58.4) · out fold (62.3) · below centre · tie arrow to the sum row |
| **59.7-62.3 s** [thoughtful] Same as paper: three in, two out. | 59.7 ("Same as paper"): every box's three inputs pulse together, then its two outputs. | Nothing new. |
| **62.3-71.3 s** [curious] Three bits count zero to seven. How do three wires pick one of eight doorbells? That's episode thirteen. | 62.3-63.9 fold back to the paper: the bit tiles become 58 over 67 with an empty answer row and empty carry boxes (the start frame). Held to 71.3 s. | NOTE "each column: 3 in, 2 out" · at end-4 (67.3) · out end · end card · tie box |

## Caption

58 + 67: every column adds 3 numbers, and so does a full adder.

#chipdesign #vlsi #computerarchitecture #semiconductors #aihardware
