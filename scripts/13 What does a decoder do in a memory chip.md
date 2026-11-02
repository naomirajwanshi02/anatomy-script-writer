```txt
[confident] Eight flats, one intercom, only THREE switches.

So how can three switches reach eight doorbells? Let's watch.

[warmly] The building has wings A and B, ground and first floors, left and right flats. The guard's panel has three switches: wing, floor, side.

Every doorbell checks all three, and rings only if all match its flat. The guard sets B wing, ground floor, right. Only that doorbell rings.

[thoughtful] Eight settings, eight doorbells, one at a time. Let's understand this in episode thirteen of chip design.

[pause] Now, the same with bits.

Each switch becomes a wire: zero or one. Wing, floor and side are the three bits of the address. Each flat becomes one row of memory.

Each row checks all three bits, like a doorbell. One mismatch keeps it quiet. B wing, ground floor, right is one zero one. [slightly excited] So only row five's line turns ON. That line, the word line, opens its row for reading.

Each extra wire doubles the rows. Twenty wires pick one of about a million rows.

[thoughtful] That's the decoder: a few wires in, one row out.

[curious] One setting rings one doorbell. Now the reverse: two sounds want your phone at once. Which one wins? That's episode fourteen.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 68 s planned; voice speed about 1.05. If a take reads "wings A and B" as "uh", keep the take whose "A" is said as the letter.

Times are planned (about 3 words per second, video 69.7 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow `script-writer/ANNOTATIONS.md` (one mark per line; times re-resolve from the quoted words in the recording). `check-annotations.py`: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.6 s** [confident] Eight flats, one intercom, only THREE switches. | Board lands (entrance): a small two-wing building on the board (wings A and B, ground and first floor, a left and a right flat door per floor: eight doors), a clear glass-bulb doorbell beside each door, one ROLLIN name plate on the building. The guard's intercom panel in front: three two-way levers engraved WING A/B, FLOOR G/1, SIDE L/R, resting in the middle (not set). | PEN ring · on "THREE" (1.8) · round the three levers · out "The building has" (6.1) |
| **2.6-6.1 s** So how can three switches reach eight doorbells? Let's watch. | 3.6 ("three switches"): the three levers pulse once together. 4.8 ("eight doorbells"): the eight bulbs glint once, left to right. | Nothing new. |
| **6.1-11.3 s** [warmly] The building has wings A and B, ground and first floors, left and right flats. | 6.1 ("The building"): the building lifts slightly. 7.4 ("wings A"): plate A, then plate B, pulse. 8.7 ("ground and first"): the ground row of doors, then the first-floor row, shade pale in turn. 10.0 ("left and right"): the left doors, then the right doors, pulse. | NOTE "2 x 2 x 2 = 8 flats" · on "wings A" (7.4) · out "Every doorbell" (14.2) · above left · tie arrow to the building |
| **11.3-13.9 s** The guard's panel has three switches: wing, floor, side. | 11.6 ("panel"): the panel pulses. 12.9 ("wing, floor, side"): each lever flicks both ways and back to the middle, in turn, 0.4 s each. | PEN box · on "three switches" (12.3) · round the three levers · out "The guard sets" (18.4)<br>NOTE "3 switches, 2 ways each" · on "three switches" (12.6) · out "The guard sets" (18.4) · outside the box · tie box |
| **14.2-18.1 s** Every doorbell checks all three, and rings only if all match its flat. | 14.2 ("Every doorbell"): three wires from the panel light faintly and branch to every doorbell. 14.9 ("checks all three"): three small hollow check dots appear beside each doorbell. 16.2 ("rings only"): the dots of one doorbell flash in turn. | Nothing new. |
| **18.4-22.6 s** The guard sets B wing, ground floor, right. Only that doorbell rings. | 19.4 ("B wing"): the wing lever drops to B; the wing dot fills on the four B-wing doorbells. 20.1 ("ground floor"): floor lever to ground; floor dots fill on the ground flats. 20.7 ("right"): side lever to right; side dots fill on the right flats. 21.0 ("Only that"): the B-ground-right doorbell (all three dots full) lights yellow with rust sound arcs spreading in front of it; every other bulb stays clear glass. Hold to 22.6. | NOTE "others miss at least one" · on "Only that" (21.0) · out "Let's understand" (25.7) · above right · tie arrow to the clear bulbs<br>PEN ring · on "Only that" (21.4) · round the ringing bulb · out "Let's understand" (25.7) |
| **22.6-28.1 s** [thoughtful] Eight settings, eight doorbells, one at a time. Let's understand this in episode thirteen of chip design. | 22.6 ("Eight settings"): the levers step through all 8 settings, 0.4 s each, each lighting a different single bulb (computed). 25.8: back on B, ground, right; that bulb lit. | NOTE "Episode 13" · on "episode thirteen" (26.5) · out end · top right · tie none · badge |
| **28.4-30.4 s** [pause] Now, the same with bits. | Fold: the eight flats slide into a stack of eight rows of memory cells (row 0 top to row 7 bottom, 8 cells each); each doorbell becomes the glass-bulb lamp at its row's right end; a small checker block appears at each row's left end; the three levers become address levers with three wires running down past every checker. | Nothing new. |
| **30.4-32.7 s** Each switch becomes a wire: zero or one. | 30.4 ("Each switch"): the lever labels change from A/B, G/1, L/R to 0/1. 31.4 ("a wire"): each lever's wire flashes along its length, in turn. 32.0 ("zero or one"): the wing (B) and side (right) wires show rust dots (they carry 1); the floor wire (ground) stays plain (0). | NOTE "B, first, right = 1" · on "Each switch" (30.4) · out "address" (36.2) · above left · tie arrow to the three levers |
| **33.0-36.2 s** Wing, floor and side are the three bits of the address. | 33.0 ("Wing, floor"): the three levers pulse in turn. 34.9 ("three bits"): a readout plate under the levers fills "1", "0", "1", one digit at a time. 36.2 ("address"): the readout pulses once. | PEN box · on "three bits" (34.9) · round the three levers and the readout · out "Each row" (39.1)<br>NOTE "address = which row to read" · on "address" (36.2) · out "One mismatch" (42.0) · outside the box · tie box |
| **36.5-38.8 s** Each flat becomes one row of memory. | 36.5 ("Each flat"): a ghost of the B-ground-right door fades over row 5 and melts into it. 37.5 ("one row"): row 5's eight cells outline once. | PEN box · on "one row" (37.5) · round row 5 · out "B wing" (43.7)<br>NOTE "row = cells, 1 bit each" · on "of memory" (37.8) · out "B wing" (43.7) · left of row 5 · tie box |
| **39.1-41.8 s** Each row checks all three bits, like a doorbell. | 39.1 ("Each row"): every checker shows three hollow dots, drawn exactly like the doorbells' dots. 40.1 ("all three bits"): on every row at once, the dots that match the wires fill: wing dot, then floor dot, then side dot. 41.1 ("like a doorbell"): for 0.8 s each row lamp shows a faint ghost of its doorbell. | Nothing new. |
| **42.0-43.5 s** One mismatch keeps it quiet. | 42.0 ("One mismatch"): row 4 (1 0 0) brightens: wing and floor dots full, side dot hollow. 43.0 ("keeps it quiet"): row 4's lamp stays clear. | PEN cross · on "One mismatch" (42.0) · beside row 4's hollow side dot · out "So only" (46.6) |
| **43.7-48.8 s** B wing, ground floor, right is one zero one. [slightly excited] So only row five's line turns ON. | Key state. 43.7 ("B wing"): the wing lever and its "1" pulse. 44.3 ("ground floor"): floor lever and "0" pulse. 45.0 ("right"): side lever and "1" pulse. 45.6 ("one zero one"): the readout "1 0 1" pulses. 46.6 ("So only"): every other row shows at least one hollow dot. 47.2 ("row five's"): row 5's three dots are all full. 48.2 ("turns ON"): row 5's word line runs rust dots left to right and its lamp lights yellow. Computed in the model: each dot = (bit of row k equals its lever), word line = AND of the three dots, row = 4·a2 + 2·a1 + a0; every setting lights exactly one row. | NOTE "1 0 1 = 4 + 0 + 1 = 5" · on "one zero one" (45.6) · out "for reading" (51.5) · right of the readout · tie arrow to the readout<br>PEN ring · on "turns ON" (48.2) · round row 5's lit lamp · out "Each extra" (52.3) · key |
| **48.8-52.2 s** That line, the word line, opens its row for reading. | Key hold continues (46.6-52.3 s, the longest hold). 48.8 ("That line"): row 5's line pulses. 49.6 ("the word line"): it thickens. 50.6 ("opens its"): row 5's eight cells light pale, left to right. 51.5 ("for reading"): their bits (1 0 1 1 0 0 1 0, from the model, not hand-set) slide out past the row's right end. | PEN arrow · on "word line" (49.6) · to row 5's line · out "Each extra" (52.3) |
| **52.3-57.2 s** Each extra wire doubles the rows. Twenty wires pick one of about a million rows. | 52.3 ("Each extra wire"): a fourth lever slides in beside the three. 53.3 ("doubles the rows"): the 8-row stack copies itself into a second stack (16 rows), drawn smaller. 54.3 ("Twenty wires"): the levers multiply to twenty, small; the stack zooms out into a dense block of thin rows. 55.9 ("about a million"): one thin row glows rust. 56.7-57.5: back to three levers and eight rows, row 5 lit. | NOTE "3→8, 4→16, 10→1024" · on "Each extra wire" (52.3) · out "That's the decoder" (57.5) · above left · tie arrow to the levers<br>NOTE "2^20 = 1,048,576" · on "about a million" (55.9) · out fold (61.1) · above right · tie underline |
| **57.5-60.8 s** [thoughtful] That's the decoder: a few wires in, one row out. | 57.5 ("That's the decoder"): the column of eight checkers glows. 58.5 ("a few wires"): the three address wires pulse. 59.8 ("one row out"): row 5's word line pulses. | PEN box · on "decoder" (57.5) · round the checker column · out fold (61.1)<br>NOTE "decoder: 3 in, 8 out" · on "decoder" (57.6) · out fold (61.1) · left of the checker column · tie box |
| **61.1-69.7 s** [curious] One setting rings one doorbell. Now the reverse: two sounds want your phone at once. Which one wins? That's episode fourteen. | 61.1-62.7 fold back to the building: row 5's lamp becomes the B-ground-right doorbell, still ringing; then the levers return to the middle and the bulb goes out (the start frame). Held to 69.7 s. | NOTE "n wires pick 1 of 2^n rows" · at end-4 (65.7) · out end · end card · tie box |

## Caption

Three wires pick one of eight rows: that is how memory finds your data.

#chipdesign #vlsi #computerarchitecture #semiconductors #aihardware
