```txt
[confident] Your key bounces five times but never types TWICE.

Five bounces, one letter. So which bounces does your keyboard ignore?

[warmly] See, slow one key press down a thousand times. Its metal contact hits, springs back and hits again. Five touches before it rests.

Count every touch, right? Nope. Five letters. Your keyboard keeps the first touch only.

[thoughtful] Take the first touch, ignore the bounces. Let's understand this in episode thirty of chip design.

[pause] Now, the same with bits.

The key becomes a switch with two contacts: rest and pressed.

Here's the trick. Each contact feeds a latch: pressed to set, rest to reset.

The first touch on pressed sets the latch to one.

Each bounce lifts the contact, but it never reaches rest. So the latch just holds its one.

[slightly excited] Five bounces in, ONE clean edge out.

Let go: one clean edge again, as the latch resets.

No latch? Many keyboards use a timer instead. It ignores changes for ten thousandths of a second.

[thoughtful] Basically, catch the first touch, ignore the bounces: that's debouncing.

[confident] Five bounces, one letter, every time.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 194 words (<code>check-voice.py</code>: PASS), about 65 s planned; voice speed about 1.05. Model (scratch): a press bounces 5 times in about 3 thousandths of a second (shown 1000x slower). Switch with two contacts (rest, pressed) into a NAND set/reset latch with pull-ups: set input = pressed contact (active low), reset input = rest contact (active low); a bounce leaves the pressed contact but never reaches rest, so the inputs go 0 1 (set), 1 1 (hold), 0 1, 1 1 ... and Q rises once. Timer method: ignore changes for 10 thousandths of a second after the first one.

Times are planned (about 3 words per second, video 71.1 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Your key bounces five times but never types TWICE. | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>debounce-key</code>. One large isometric keyboard key on the board (key cap engraved A, one ROLLIN maker's plate on the key's base), cut away at the side so its springy metal contact leaf and the contact pad under it show. Beside it a small backlit light-blue LCD screen (JetBrains Mono) showing what is typed. Below the board: a readout with two counters, "touches" and "letters", and a small "x 1000 slower" state tag. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Your key bounces"): a flat 2D finger (side profile, soft ground shadow) presses the key; in slow motion the leaf hits the pad, springs up, hits again: the touches counter rolls 1 to 5. 2.0 ("never types TWICE"): the screen shows a single A; the letters counter reads 1. Then the finger lifts and the screen clears (the start frame). | NOTE "5 touches, 1 letter" · on "Your key bounces" (0.0) · out "slow one key" (7.6) · above right · tie arrow to the two counters · hook |
| **3.3-7.0 s** Five bounces, one letter. So which bounces does your keyboard ignore? | 3.3 ("Five bounces"): the touches counter's 5 pulses. 4.0 ("one letter"): the screen's single A pulses. Then the counters reset. | PEN ring · on "one letter" (4.0) · round the screen's A · out "slow one key" (7.6) |
| **7.3-10.3 s** [warmly] See, slow one key press down a thousand times. | 7.6 ("slow one key"): the "x 1000 slower" tag lights. 9.3 ("a thousand times"): the finger starts a slow press. | NOTE "real bounce: thousandths of a second" · on "a thousand times" (9.3) · out "keeps the first" (18.6) · above left · tie arrow to the slow-motion tag |
| **10.6-15.3 s** Its metal contact hits, springs back and hits again. Five touches before it rests. | 10.9 ("metal contact hits"): the leaf hits the pad (touch 1). 11.9 ("springs back"): it bounces up a hair. 12.9 ("hits again"): touch 2. 13.6 ("Five touches"): touches 3, 4 and 5, each bounce smaller, the counter rolling 1 to 5. 14.3 ("before it rests"): the leaf rests on the pad. | NOTE "each bounce smaller" · on "springs back" (11.9) · out "Count every touch" (15.6) · below left · tie arrow to the leaf |
| **15.6-20.3 s** Count every touch, right? Nope. Five letters. Your keyboard keeps the first touch only. | 15.6 ("Count every touch"): a ghost simple counter beside the screen types A A A A A on the five touches. 17.3 ("Five letters"): its five letters pulse; red dashed warning outline round them. 18.6 ("keeps the first"): the real screen shows one A on touch 1 and nothing more. | NOTE "AAAAA vs A" · on "Five letters" (17.3) · out "Take the first" (20.6) · above right · tie arrow to the ghost counter<br>PEN tick · on "keeps the first" (18.6) · beside the screen's single A · out fold (26.2) |
| **20.6-25.9 s** [thoughtful] Take the first touch, ignore the bounces. Let's understand this in episode thirty of chip design. | 20.6 ("Take the first touch"): touch 1 replays and its A appears. 21.9 ("ignore the bounces"): touches 2-5 replay, greyed. Steady hold. | NOTE "Episode 30" · on "episode thirty" (24.3) · out end · top right · tie none · badge |
| **26.2-28.2 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics board (VDD rail at the back, GND rail at the front, both engraved). The key becomes a switch lever with two contacts, "rest" (bottom) and "pressed" (top), its common arm tied to GND; each contact has a pull-up to VDD and feeds one input of a set/reset latch made of two cross-coupled NAND gate blocks (the episode's latch from the digital electronics series); the latch output Q drives an output lamp and a counter of rising edges (the letters counter). Below the board: a DE-style graph, three rows: pressed contact, rest contact, Q. | Nothing new. |
| **28.5-32.2 s** The key becomes a switch with two contacts: rest and pressed. | 28.5 ("The key becomes"): a ghost key shows over the switch lever and melts into it. 30.5 ("two contacts"): both contacts pulse. 31.2 ("rest and pressed"): the lever rests on "rest". | NOTE "lever on rest: Q = 0" · on "rest and pressed" (31.2) · out "sets the latch" (39.2) · above left · tie arrow to the switch lever |
| **32.5-37.2 s** Here's the trick. Each contact feeds a latch: pressed to set, rest to reset. | 34.2 ("feeds a latch"): the two NAND blocks and their cross wires outline. 35.2 ("pressed to set"): the wire from "pressed" to the set input flashes. 36.2 ("rest to reset"): the wire from "rest" to the reset input flashes. | PEN box · on "feeds a latch" (34.2) · round the two NAND gates · out "Five bounces in" (47.1)<br>NOTE "2 NANDs = set/reset latch" · on "feeds a latch" (34.2) · out "Five bounces in" (47.1) · outside the box · tie box |
| **37.5-40.8 s** The first touch on pressed sets the latch to one. | 37.5 ("The first touch"): the lever swings up and touches "pressed": the pressed row on the graph drops to 0 (set active). 39.2 ("sets the latch"): Q rises to 1, the lamp lights, the edge counter reads 1 (computed). | NOTE "touch: set input 0 → Q = 1" · on "sets the latch" (39.2) · out "never reaches rest" (43.4) · below left · tie arrow to Q on the graph |
| **41.1-46.8 s** Each bounce lifts the contact, but it never reaches rest. So the latch just holds its one. | 41.1 ("Each bounce lifts"): the lever bounces off "pressed" four times (slow motion); the pressed row returns to 1 between touches (pull-up). 43.4 ("never reaches rest"): the rest row stays at 1 throughout. 45.8 ("holds its one"): Q stays 1 (computed: inputs 1 1 = hold). | NOTE "inputs 1 1 = hold" · on "Each bounce lifts" (41.1) · out "ONE clean edge" (48.1) · above right · tie arrow to the latch<br>NOTE "rest stays 1: no reset" · on "never reaches rest" (43.4) · out "ONE clean edge" (48.1) · below right · tie arrow to the rest row |
| **47.1-49.4 s** [slightly excited] Five bounces in, ONE clean edge out. | Key state. 47.1 ("Five bounces in"): the pressed row shows its five drops. 48.1 ("ONE clean edge out"): the Q row shows one clean rise; the edge counter reads 1 beside a ghost 5. The single rise and the counter at 1 stay until the latch resets in the next row (the longest hold). | PEN ring · on "ONE clean edge" (48.1) · round the single rise of Q · out "latch resets" (52.4) · key |
| **49.7-53.0 s** Let go: one clean edge again, as the latch resets. | 49.7 ("Let go"): the lever swings down and bounces on the rest contact (slow motion). 52.0 ("the latch resets"): the rest row drops; Q falls to 0 once; the bounces on rest change nothing (computed). | NOTE "release: one clean fall" · on "latch resets" (52.4) · out "a timer" (55.0) · below left · tie arrow to Q's fall |
| **53.3-59.0 s** No latch? Many keyboards use a timer instead. It ignores changes for ten thousandths of a second. | 54.6 ("use a timer"): a small timer block slides in after a single-contact key, its input showing the five bounces. 57.3 ("ten thousandths"): after the first change, the timer's output holds for a shaded 10 thousandths of a second, so the later bounces are ignored; one clean edge out (computed). | NOTE "first change, then 10 ms deaf" · on "ten thousandths" (57.3) · out fold (62.9) · above left · tie arrow to the shaded wait |
| **59.3-62.6 s** [thoughtful] Basically, catch the first touch, ignore the bounces: that's debouncing. | 59.6 ("catch the first touch"): the timer slides out; the latch's single clean Q edge pulses. | Nothing new. |
| **62.9-71.1 s** [confident] Five bounces, one letter, every time. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 62.9-64.5 fold back: the switch becomes the key, the latch the keyboard's logic, the graph the two counters at 0 (the start frame: key up, screen empty). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "first touch counts, bounces don't" · at end-4 (67.1) · out end · end card · tie box |

## Caption

1 key press bounces 5 times, yet you type 1 letter: debouncing.

#chipdesign #vlsi #computerarchitecture #semiconductors #tech
