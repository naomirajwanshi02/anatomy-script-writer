```txt
[confident] Why does a CALL always stop your music?

Your music started first. Why does a call still stop it? Let's watch.

[warmly] Your phone ranks sounds: call, alarm, music, then a message ping.

Music plays. A call comes in and takes the speaker.

Hang up: the music returns, still on, just ranked lower.

[thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design.

[pause] Now, the same with bits.

Each sound gets a wire, ranked three for the call down to zero. Each wire holds a bit: one while its sound is on.

The speaker becomes two output bits: the winning wire's number.

Music is wire one: the output reads zero one.

A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED.

Hang up the call: zero one again.

A ping alone reads zero zero, and so does silence. So a third bit, valid, says if any wire is on.

[thoughtful] That's a priority encoder: the highest wire on wins, not the first.

[curious] Here, one sound wins the speaker. But what if a tap fills a tank while another drains it? That's episode fifteen.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 199 words (<code>check-voice.py</code>: PASS), about 71 s planned; voice speed about 1.05. Codes are written as words ("zero one", "one one") so the take does not read "01" as "one"; keep the take whose "valid" is said as one word, not spelled.

Times are planned (about 3 words per second, video 72.6 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Note check: PASS (max 3 at once, 1.5 s apart, 2.5 s each, nothing in folds).

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] Why does a CALL always stop your music? | Board lands (entrance): a phone standing upright on the board (isometric, large), its backlit blue LCD screen showing a music bar, rust sound arcs spreading in front of its speaker. Beside it a column of four raised sound tiles, top to bottom: call (handset icon), alarm (bell), music (note), ping (speech bubble). The music tile is rust (on); the other three are dark. 1.0 ("CALL"): the call tile glints once. | Nothing (let the music play). |
| **3.0-7.3 s** Your music started first. Why does a call still stop it? Let's watch. | 3.3 ("music started"): the music tile pulses and shows a small engraved "1st" tag for 1.5 s. 5.3 ("a call"): the call tile glints once. 6.7 ("Let's watch"): the music arcs pulse with the beat. | Nothing new. |
| **7.6-11.3 s** [warmly] Your phone ranks sounds: call, alarm, music, then a message ping. | 8.3 ("ranks"): the four tiles light their icons top to bottom, 0.2 s apart. 8.9 ("call,"): the call tile pulses; 9.3 ("alarm,"): the alarm tile; 9.6 ("music,"): the music tile; 10.6 ("message ping"): the ping tile. The music tile stays rust throughout. | In 8.3 s (on "ranks"), out 12.9 s: above the board, left, "set by the phone's maker". |
| **11.6-14.9 s** Music plays. A call comes in and takes the speaker. | 11.6 ("Music plays"): the music arcs pulse. 12.6 ("A call"): the call tile turns rust; the screen switches to an incoming call (caller ID plate engraved ROLLIN, the one in-story ROLLIN). 13.9 ("takes the speaker"): the music arcs stop and ring arcs spread from the speaker; the music tile STAYS rust. | 12.6 s, on "A call" (pen mark): olive arrow to the call tile, stopping short of it, off at 15.2 s. |
| **15.2-18.5 s** Hang up: the music returns, still on, just ranked lower. | 15.2 ("Hang up"): the call tile goes dark; the screen collapses back to the music bar. 16.2 ("the music returns"): the music arcs return. 16.9 ("still on"): the music tile pulses (it never went dark). 17.9 ("ranked lower"): the call tile, then the music tile, pulse in turn. | 16.9 s, on "still on" (pen mark): olive ring round the music tile, off at 18.8 s. In 16.9 s (on "still on"), out 21.5 s: above the board, right, "lit tile = wants the speaker". |
| **18.8-24.5 s** [thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design. | 19.1 ("highest-ranked"): a pulse runs down the tiles from the top and stops at the first rust tile (music). 20.5 ("gets the speaker"): the pulse runs from the music tile into the speaker; the music arcs brighten. Hold. | In 22.8 s (on "episode fourteen"), to the end: top right, "Episode 14" badge. |
| **25.4-27.1 s** [pause] Now, the same with bits. | Fold: the four tiles slide left and become four levers in a column (call on top, then alarm, music, ping), the music lever up, the others down; a wire runs from each lever into one plain block; the phone's speaker shrinks into two clear glass-bulb output lamps on the block's right side. The phone leaves the board. | Nothing (notes wiped at 25.4 s; the badge stays). |
| **27.4-31.7 s** Each sound gets a wire, ranked three for the call down to zero. | 27.4 ("Each sound"): the four wires draw in left to right, one after the other. 29.1 ("ranked three"): the numbers 3, 2, 1, 0 engrave beside the levers, top to bottom, 0.3 s apart, each with its small sound icon. 30.4 ("the call"): the 3 and its handset pulse. 31.4 ("zero"): the 0 and its speech bubble pulse. | In 29.4 s (on "three"), out 34.6 s: left of the levers, "2 alarm, 1 music, 0 ping". |
| **31.9-35.5 s** Each wire holds a bit: one while its sound is on. | 32.2 ("wire holds"): all four wires pulse faintly once. 33.6 ("one while"): rust dots run along the music wire (lever 1, up) into the block. 34.6 ("its sound"): the music icon beside lever 1 pulses. The other three wires stay plain (0). | Nothing new. |
| **35.8-39.2 s** The speaker becomes two output bits: the winning wire's number. | 36.1 ("The speaker"): the two output lamps rise from the block with place labels "2" and "1" under them; the "1" lamp is lit yellow, the "2" lamp clear glass (computed). Leave 12 px clear round both lamps. 38.1 ("the winning"): both lamps blink once. | 36.8 s, on "two output" (pen mark): olive square-cornered box round the two output lamps, 12 px clear, off at 42.8 s. In 36.8 s (on "two output"), out 41.8 s: just outside the box, above, "2 bits count 0 to 3". |
| **39.5-42.5 s** Music is wire one: the output reads zero one. | 39.5 ("Music is wire one"): lever 1 and its icon pulse. 41.5 ("reads zero one"): the "2" lamp stays clearly dark; the "1" lamp pulses brighter. | In 41.8 s (on "zero one"), out 46.8 s: above the board, right, "1 in binary = 01". |
| **42.8-49.8 s** A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED. | Key state. 43.1 ("A call"): lever 3's handset icon pulses. 44.1 ("wire three"): lever 3 flips up; rust dots run along wire 3 into the block. 46.8 ("one one"): the "2" lamp lights yellow; the "1" lamp stays lit (it never flickers). 47.8 ("The music wire"): wire 1 keeps flowing rust and its dots stop at the block's edge; lever 1 stays up. Hold 44.1-50.0 s (the longest hold). Computed in the model: Y1 = D3 + D2, Y0 = D3 + D2'·D1, valid = D3 + D2 + D1 + D0; with D3 = 1 the output is 1 1 whatever D2, D1 and D0 are; the analogy's speaker plays the highest rust tile from the same function. | In 46.8 s (on "one one"), out 51.3 s: above the board, right, "3 = 2 + 1 = 11". 49.5 s, on "IGNORED" (pen mark): olive ring round lever 1, off at 51.3 s. |
| **50.0-52.4 s** Hang up the call: zero one again. | 50.0 ("Hang up"): lever 3 drops; wire 3 goes plain. 51.3 ("zero one again"): the "2" lamp goes dark; the "1" lamp stays lit. | Nothing new. |
| **52.7-56.0 s** A ping alone reads zero zero, and so does silence. | 52.7 ("A ping alone"): lever 1 drops, then lever 0 flips up, with rust dots on wire 0; both output lamps dark. 54.7 ("and so does"): lever 0 drops; all four levers down; both lamps still dark: the same picture. 55.7 ("silence"): hold. | Nothing new. |
| **56.2-59.8 s** So a third bit, valid, says if any wire is on. | 56.5 ("a third bit"): a third glass-bulb lamp rises below the two, label "valid", clear glass. 57.5 ("valid,"): lever 0 flips up: the valid lamp lights yellow; the two output lamps stay dark. 58.5 ("any wire"): lever 0 drops: the valid lamp goes dark. | In 57.5 s (on "valid,"), out 62.4 s: above the board, left, "ping: valid 1, silence: valid 0". |
| **60.1-64.1 s** [thoughtful] That's a priority encoder: the highest wire on wins, not the first. | 60.1 ("That's a priority"): lever 1 flips up first: lamps 0 1, valid lit. 61.8 ("highest wire"): lever 3 flips up after it: lamps 1 1. 62.8 ("wins,"): wire 3 pulses. 63.1 ("not the first"): lever 1 shows the "1st" tag for 1 s; the outputs do not change. | 60.8 s, on "priority" (pen mark): olive square-cornered box round the block and its three lamps, off at 64.4 s. In 60.8 s (on "priority"), out 64.4 s: below the board, "no clock, no memory of order". |
| **64.4-72.6 s** [curious] Here, one sound wins the speaker. But what if a tap fills a tank while another drains it? That's episode fifteen. | 64.4-66.0 fold back to the phone: the levers slide back into the four tiles, the lamps grow back into the speaker; only the music tile rust, the music arcs playing (the start frame). Held to 72.6 s. | Nothing during the fold. In 68.6 s (4 s before the end), to the end: end card in the subtitle area, boxed "highest wire on wins", with "Episode 15 →" at the very bottom. |
