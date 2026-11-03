```txt
[confident] Two sounds, one speaker, and your CALL never loses.

Your music started first, so it keeps the speaker, right? Nope. Let's watch.

[warmly] See, your phone ranks sounds: call, alarm, music, then a message ping.

Music plays. A call comes in and takes the speaker.

Hang up: the music's back, still on, just ranked lower.

[thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design.

[pause] Now, the same with bits.

Each sound gets a wire. The call is three, the ping is zero. Each wire holds a bit: one while its sound is on.

The speaker? Two output bits: the winning wire's number.

Music is wire one: the output reads zero one.

A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED.

Hang up: zero one again.

Here's the catch. A ping alone reads zero zero, and so does silence. So a third bit, valid, says if any wire is on.

[thoughtful] Basically, a priority encoder: the highest wire on wins, not the first.

[confident] Your call wins, every time. Now you can explain what most engineers can't. Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 199 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. Codes are written as words ("zero one", "one one") so the take does not read "01" as "one"; keep the take whose "valid" is said as one word, not spelled.

Times are planned (about 3 words per second, video 72.9 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Two sounds, one speaker, and your CALL never loses. | Board lands (entrance): a phone standing upright on the board (isometric, large), its backlit blue LCD screen showing a music bar, rust sound arcs spreading in front of its speaker and pulsing with the beat while the board lands. Beside it a column of four raised sound tiles, top to bottom: call (handset icon), alarm (bell), music (note), ping (speech bubble). The music tile is rust (on); the other three are dark. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Two sounds"): the music tile pulses, then the call tile flashes on beside it (both on screen together). 0.7 ("one speaker"): the phone's speaker grille outlines. 2.0 ("CALL"): the call tile turns rust and big ring arcs (at least 24 px apart) replace the music arcs (computed: the highest lit tile wins the speaker). 2.3 ("never loses"): the music tile stays rust but its arcs only flicker once and give way. 2.6 ("Two sounds" + 2.6 s): the call tile goes dark and the music arcs return (the start frame). | NOTE "the call beats music, every time" · on "Two sounds" (0.0) · out "Let's watch" (7.0) · above right · tie arrow to the call tile · hook<br>PEN underline · on "CALL" (2.0) · under "call" · out "Let's watch" (7.0) |
| **3.3-7.6 s** Your music started first, so it keeps the speaker, right? Nope. Let's watch. | 3.6 ("music started"): the music tile pulses and shows a small engraved "1st" tag for 1.5 s. 6.6 ("Nope"): the call tile glints once. 7.0 ("Let's watch"): the music arcs pulse with the beat. | NOTE "first in ≠ winner" · on "started first" (4.0) · out "ranks" (8.9) · below left · tie arrow to the music tile's 1st tag |
| **7.9-11.9 s** [warmly] See, your phone ranks sounds: call, alarm, music, then a message ping. | 8.9 ("ranks"): the four tiles light their icons top to bottom, 0.2 s apart. 9.6 ("call,"): the call tile pulses; 9.9 ("alarm,"): the alarm tile; 10.2 ("music,"): the music tile; 11.2 ("message ping"): the ping tile. The music tile stays rust throughout. | NOTE "set by the phone's maker" · on "ranks" (8.9) · out "A call comes" (12.9) · above left · tie arrow to the four tiles |
| **12.2-15.5 s** Music plays. A call comes in and takes the speaker. | 12.2 ("Music plays"): the music arcs pulse. 12.9 ("A call"): the call tile turns rust; the screen switches to an incoming call (caller ID plate engraved ROLLIN, the one in-story ROLLIN). 14.5 ("takes the speaker"): the music arcs stop and ring arcs spread from the speaker; the music tile STAYS rust. | PEN arrow · on "A call" (12.9) · to the call tile · out "Hang up" (15.8) |
| **15.8-19.1 s** Hang up: the music's back, still on, just ranked lower. | 15.8 ("Hang up"): the call tile goes dark; the screen collapses back to the music bar. 16.5 ("the music's back"): the music arcs return. 17.5 ("still on"): the music tile pulses (it never went dark). 18.5 ("ranked lower"): the call tile, then the music tile, pulse in turn. | NOTE "lit tile = wants the speaker" · on "still on" (17.5) · out "Let's understand" (22.1) · above right · tie arrow to the music tile |
| **19.4-25.1 s** [thoughtful] The highest-ranked sound that's on gets the speaker. Let's understand this in episode fourteen of chip design. | 19.7 ("highest-ranked"): a pulse runs down the tiles from the top and stops at the first rust tile (music). 21.1 ("gets the speaker"): the pulse runs from the music tile into the speaker; the music arcs brighten. Hold. | NOTE "Episode 14" · on "episode fourteen" (23.4) · out end · top right · tie none · badge |
| **25.4-27.4 s** [pause] Now, the same with bits. | Fold: the four tiles slide left and become four levers in a column (call on top, then alarm, music, ping), the music lever up, the others down; a wire runs from each lever into one plain block; the phone's speaker shrinks into two clear glass-bulb output lamps on the block's right side. The phone leaves the board. | Nothing new. |
| **27.7-32.0 s** Each sound gets a wire. The call is three, the ping is zero. | 27.7 ("Each sound"): the four wires draw in left to right, one after the other. 29.7 ("call is three"): the numbers 3, 2, 1, 0 engrave beside the levers, top to bottom, 0.3 s apart, each with its small sound icon. 29.4 ("the call"): the 3 and its handset pulse. 31.7 ("zero"): the 0 and its speech bubble pulse. | NOTE "4 sounds, 4 wires" · on "Each sound" (27.7) · out "Each wire holds" (32.3) · above left · tie arrow to the four wires<br>NOTE "2 alarm, 1 music" · on "call is three" (29.7) · out "its sound" (34.6) · left of the levers · tie arrow to the levers |
| **32.3-36.0 s** Each wire holds a bit: one while its sound is on. | 32.6 ("wire holds"): all four wires pulse faintly once. 34.0 ("one while"): rust dots run along the music wire (lever 1, up) into the block. 34.6 ("its sound"): the music icon beside lever 1 pulses. The other three wires stay plain (0). | NOTE "1 = on, 0 = off" · on "one while" (34.0) · out "Music is wire" (39.6) · below left · tie arrow to the music wire |
| **36.3-39.3 s** The speaker? Two output bits: the winning wire's number. | 36.3 ("The speaker"): the two output lamps rise from the block with place labels "2" and "1" under them; the "1" lamp is lit yellow, the "2" lamp clear glass (computed). Leave 12 px clear round both lamps. 38.0 ("the winning"): both lamps blink once. | PEN box · on "two output" (37.0) · round the two output lamps · out "A call comes" (42.9)<br>NOTE "2 bits count 0 to 3" · on "two output" (37.0) · out "zero one" (41.9) · outside the box · tie box |
| **39.6-42.6 s** Music is wire one: the output reads zero one. | 39.6 ("Music is wire one"): lever 1 and its icon pulse. 41.6 ("reads zero one"): the "2" lamp stays clearly dark; the "1" lamp pulses brighter. | NOTE "1 in binary = 01" · on "reads zero one" (41.6) · out "one one" (46.9) · above right · tie arrow to the "1" lamp |
| **42.9-49.9 s** A call comes in: wire three turns on. [slightly excited] The output jumps to one one. The music wire stays on, but IGNORED. | Key state. 42.9 ("A call"): lever 3's handset icon pulses. 44.2 ("wire three"): lever 3 flips up; rust dots run along wire 3 into the block. 46.9 ("one one"): the "2" lamp lights yellow; the "1" lamp stays lit (it never flickers). 47.6 ("The music wire"): wire 1 keeps flowing rust and its dots stop at the block's edge; lever 1 stays up. Hold 44.1-50.0 s (the longest hold). Computed in the model: Y1 = D3 + D2, Y0 = D3 + D2'·D1, valid = D3 + D2 + D1 + D0; with D3 = 1 the output is 1 1 whatever D2, D1 and D0 are; the analogy's speaker plays the highest rust tile from the same function. | NOTE "3 = 2 + 1 = 11" · on "one one" (46.9) · out "zero one again" (50.9) · above right · tie arrow to the two lit lamps<br>PEN ring · on "IGNORED" (49.6) · round lever 1 · out "A ping alone" (53.2) · key |
| **50.2-51.9 s** Hang up: zero one again. | 50.2 ("Hang up"): lever 3 drops; wire 3 goes plain. 50.9 ("zero one again"): the "2" lamp goes dark; the "1" lamp stays lit. | Nothing new. |
| **52.2-56.5 s** Here's the catch. A ping alone reads zero zero, and so does silence. | 53.2 ("A ping alone"): lever 1 drops, then lever 0 flips up, with rust dots on wire 0; both output lamps dark. 55.2 ("and so does"): lever 0 drops; all four levers down; both lamps still dark: the same picture. 56.2 ("silence"): hold. | NOTE "00: ping, or nothing?" · on "A ping alone" (53.2) · out "valid" (58.1) · below left · tie arrow to the output bits |
| **56.8-60.5 s** So a third bit, valid, says if any wire is on. | 57.1 ("a third bit"): a third glass-bulb lamp rises below the two, label "valid", clear glass. 58.1 ("valid,"): lever 0 flips up: the valid lamp lights yellow; the two output lamps stay dark. 59.1 ("any wire"): lever 0 drops: the valid lamp goes dark. | NOTE "ping: valid 1, silence: valid 0" · on "valid" (58.1) · out "not the first" (63.8) · above left · tie arrow to the valid lamp |
| **60.8-64.8 s** [thoughtful] Basically, a priority encoder: the highest wire on wins, not the first. | 61.1 ("a priority"): lever 1 flips up first: lamps 0 1, valid lit. 62.5 ("highest wire"): lever 3 flips up after it: lamps 1 1. 63.5 ("wins,"): wire 3 pulses. 63.8 ("not the first"): lever 1 shows the "1st" tag for 1 s; the outputs do not change. | NOTE "call came last, still wins" · on "priority" (61.5) · out fold (65.1) · below centre · tie arrow to the encoder's output bits |
| **65.1-72.9 s** [confident] Your call wins, every time. Now you can explain what most engineers can't. Follow, and keep it that way. | 65.1-66.7 fold back to the phone: the levers slide back into the four tiles, the lamps grow back into the speaker; only the music tile rust, the music arcs playing (the start frame). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "top-ranked input always wins" · at end-4 (68.9) · out end · end card · tie box |

## Caption

4 sounds, 1 speaker: why a call always stops your music.

#chipdesign #computerarchitecture #vlsi #semiconductors #tech
