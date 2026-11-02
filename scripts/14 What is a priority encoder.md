```txt
[confident] Two sounds, one speaker, and your CALL never loses.

Your music started first. So why does the call still win? Let's watch.

[warmly] Your phone ranks sounds: call, alarm, music, then a message ping.

Music plays. A call comes in and takes the speaker.

Hang up: the music returns, still on, just ranked lower.

[thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design.

[pause] Now, the same with bits.

Each sound gets a wire. The call is three, the ping is zero. Each wire holds a bit: one while its sound is on.

The speaker becomes two output bits: the winning wire's number.

Music is wire one: the output reads zero one.

A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED.

Hang up the call: zero one again.

A ping alone reads zero zero, and so does silence. So a third bit, valid, says if any wire is on.

[thoughtful] That's a priority encoder: the highest wire on wins, not the first.

[curious] Here, one sound wins the speaker. But what if a tap fills a tank while another drains it? That's episode fifteen.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 71 s planned; voice speed about 1.05. Codes are written as words ("zero one", "one one") so the take does not read "01" as "one"; keep the take whose "valid" is said as one word, not spelled.

Times are planned (about 3 words per second, video 72.6 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.7 s** [confident] Two sounds, one speaker, and your CALL never loses. | Board lands (entrance): a phone standing upright on the board (isometric, large), its backlit blue LCD screen showing a music bar, rust sound arcs spreading in front of its speaker. Beside it a column of four raised sound tiles, top to bottom: call (handset icon), alarm (bell), music (note), ping (speech bubble). The music tile is rust (on); the other three are dark. Visual hook: 1.6 ("CALL never loses"): the call tile turns rust for 0.8 s and ring arcs replace the music arcs (computed: highest lit tile wins the speaker); then the call tile goes dark and the music arcs return. | PEN ring · on "never loses" (2.3) · round the call tile · out "Let's watch" (6.7) |
| **3.0-7.3 s** Your music started first. So why does the call still win? Let's watch. | 3.3 ("music started"): the music tile pulses and shows a small engraved "1st" tag for 1.5 s. 5.3 ("the call"): the call tile glints once. 6.7 ("Let's watch"): the music arcs pulse with the beat. | Nothing new. |
| **7.6-11.3 s** [warmly] Your phone ranks sounds: call, alarm, music, then a message ping. | 8.3 ("ranks"): the four tiles light their icons top to bottom, 0.2 s apart. 8.9 ("call,"): the call tile pulses; 9.3 ("alarm,"): the alarm tile; 9.6 ("music,"): the music tile; 10.6 ("message ping"): the ping tile. The music tile stays rust throughout. | NOTE "set by the phone's maker" · on "ranks" (8.3) · out "A call comes" (12.6) · above left · tie arrow to the four tiles |
| **11.6-14.9 s** Music plays. A call comes in and takes the speaker. | 11.6 ("Music plays"): the music arcs pulse. 12.6 ("A call"): the call tile turns rust; the screen switches to an incoming call (caller ID plate engraved ROLLIN, the one in-story ROLLIN). 13.9 ("takes the speaker"): the music arcs stop and ring arcs spread from the speaker; the music tile STAYS rust. | PEN arrow · on "A call" (12.6) · to the call tile · out "Hang up" (15.2) |
| **15.2-18.5 s** Hang up: the music returns, still on, just ranked lower. | 15.2 ("Hang up"): the call tile goes dark; the screen collapses back to the music bar. 16.2 ("the music returns"): the music arcs return. 16.9 ("still on"): the music tile pulses (it never went dark). 17.9 ("ranked lower"): the call tile, then the music tile, pulse in turn. | PEN ring · on "still on" (16.9) · round the music tile · out "highest-ranked" (19.1)<br />NOTE "lit tile = wants the speaker" · on "still on" (17.2) · out "Let's understand" (21.6) · above right · tie arrow to the music tile |
| **18.8-24.5 s** [thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design. | 19.1 ("highest-ranked"): a pulse runs down the tiles from the top and stops at the first rust tile (music). 20.5 ("gets the speaker"): the pulse runs from the music tile into the speaker; the music arcs brighten. Hold. | NOTE "Episode 14" · on "episode fourteen" (22.8) · out end · top right · tie none · badge |
| **25.4-27.1 s** [pause] Now, the same with bits. | Fold: the four tiles slide left and become four levers in a column (call on top, then alarm, music, ping), the music lever up, the others down; a wire runs from each lever into one plain block; the phone's speaker shrinks into two clear glass-bulb output lamps on the block's right side. The phone leaves the board. | Nothing new. |
| **27.4-31.7 s** Each sound gets a wire. The call is three, the ping is zero. | 27.4 ("Each sound"): the four wires draw in left to right, one after the other. 29.1 ("call is three"): the numbers 3, 2, 1, 0 engrave beside the levers, top to bottom, 0.3 s apart, each with its small sound icon. 29.6 ("the call"): the 3 and its handset pulse. 31.4 ("zero"): the 0 and its speech bubble pulse. | NOTE "2 alarm, 1 music" · on "call is three" (29.1) · out "its sound" (34.6) · left of the levers · tie arrow to the levers |
| **31.9-35.5 s** Each wire holds a bit: one while its sound is on. | 32.2 ("wire holds"): all four wires pulse faintly once. 33.6 ("one while"): rust dots run along the music wire (lever 1, up) into the block. 34.6 ("its sound"): the music icon beside lever 1 pulses. The other three wires stay plain (0). | Nothing new. |
| **35.8-39.2 s** The speaker becomes two output bits: the winning wire's number. | 36.1 ("The speaker"): the two output lamps rise from the block with place labels "2" and "1" under them; the "1" lamp is lit yellow, the "2" lamp clear glass (computed). Leave 12 px clear round both lamps. 38.1 ("the winning"): both lamps blink once. | PEN box · on "two output" (36.8) · round the two output lamps · out "A call comes" (42.8)<br />NOTE "2 bits count 0 to 3" · on "two output" (37.0) · out "zero one" (41.8) · outside the box · tie box |
| **39.5-42.5 s** Music is wire one: the output reads zero one. | 39.5 ("Music is wire one"): lever 1 and its icon pulse. 41.5 ("reads zero one"): the "2" lamp stays clearly dark; the "1" lamp pulses brighter. | NOTE "1 in binary = 01" · on "reads zero one" (41.8) · out "one one" (46.8) · above right · tie arrow to the "1" lamp |
| **42.8-49.8 s** A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED. | Key state. 43.1 ("A call"): lever 3's handset icon pulses. 44.1 ("wire three"): lever 3 flips up; rust dots run along wire 3 into the block. 46.8 ("one one"): the "2" lamp lights yellow; the "1" lamp stays lit (it never flickers). 47.8 ("The music wire"): wire 1 keeps flowing rust and its dots stop at the block's edge; lever 1 stays up. Hold 44.1-50.0 s (the longest hold). Computed in the model: Y1 = D3 + D2, Y0 = D3 + D2'·D1, valid = D3 + D2 + D1 + D0; with D3 = 1 the output is 1 1 whatever D2, D1 and D0 are; the analogy's speaker plays the highest rust tile from the same function. | NOTE "3 = 2 + 1 = 11" · on "one one" (46.8) · out "zero one again" (51.3) · above right · tie arrow to the two lit lamps<br />PEN ring · on "IGNORED" (49.5) · round lever 1 · out "A ping alone" (52.7) · key |
| **50.0-52.4 s** Hang up the call: zero one again. | 50.0 ("Hang up"): lever 3 drops; wire 3 goes plain. 51.3 ("zero one again"): the "2" lamp goes dark; the "1" lamp stays lit. | Nothing new. |
| **52.7-56.0 s** A ping alone reads zero zero, and so does silence. | 52.7 ("A ping alone"): lever 1 drops, then lever 0 flips up, with rust dots on wire 0; both output lamps dark. 54.7 ("and so does"): lever 0 drops; all four levers down; both lamps still dark: the same picture. 55.7 ("silence"): hold. | Nothing new. |
| **56.2-59.8 s** So a third bit, valid, says if any wire is on. | 56.5 ("a third bit"): a third glass-bulb lamp rises below the two, label "valid", clear glass. 57.5 ("valid,"): lever 0 flips up: the valid lamp lights yellow; the two output lamps stay dark. 58.5 ("any wire"): lever 0 drops: the valid lamp goes dark. | NOTE "ping: valid 1, silence: valid 0" · on "valid" (57.5) · out "not the first" (63.1) · above left · tie arrow to the valid lamp |
| **60.1-64.1 s** [thoughtful] That's a priority encoder: the highest wire on wins, not the first. | 60.1 ("That's a priority"): lever 1 flips up first: lamps 0 1, valid lit. 61.8 ("highest wire"): lever 3 flips up after it: lamps 1 1. 62.8 ("wins,"): wire 3 pulses. 63.1 ("not the first"): lever 1 shows the "1st" tag for 1 s; the outputs do not change. | PEN box · on "priority" (60.8) · round the block and its three lamps · out fold (64.4)<br />NOTE "call came last, still wins" · on "priority" (61.0) · out fold (64.4) · below centre · tie box |
| **64.4-72.6 s** [curious] Here, one sound wins the speaker. But what if a tap fills a tank while another drains it? That's episode fifteen. | 64.4-66.0 fold back to the phone: the levers slide back into the four tiles, the lamps grow back into the speaker; only the music tile rust, the music arcs playing (the start frame). Held to 72.6 s. | NOTE "top-ranked input always wins" · at end-4 (68.6) · out end · end card · tie box |

## Caption

4 sounds, 1 speaker: why a call always stops your music.

#chipdesign #computerarchitecture #vlsi #semiconductors #tech
