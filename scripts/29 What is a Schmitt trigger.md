```txt
[confident] Your heater never clicks twice a SECOND. Why not?

The room wobbles all the time. So why doesn't your heater click?

[warmly] See, picture a heater with one line: on below twenty, off above.

Near twenty, the room wobbles. The heater clicks on, off, on, off, on.

Here's the trick. Your thermostat uses two lines instead: on at nineteen, off at twenty-one. A small wobble near twenty crosses neither line.

[thoughtful] Two lines, a gap between, no chatter. Let's understand this in episode twenty-nine of chip design.

[pause] Now, the same with bits.

The heater becomes an inverter. The temperature, its input: a slow, noisy wire.

A normal inverter has one middle line. Near it, noise flips the output again and again.

Just one flip, right? Nope. Five flips for one slow edge. The next gate sees them all.

A Schmitt trigger has two lines: high for rising, low for falling.

[slightly excited] The same noisy edge now flips the output just ONCE.

Basically, that gap is called hysteresis. It's wider than the wobble.

[thoughtful] Two lines and a gap: one click, no chatter.

[confident] Two lines, so your heater never chatters.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 199 words (<code>check-voice.py</code>: PASS), about 66 s planned; voice speed about 1.05. Model (scratch): input = a slow ramp 0 to 1 over 10 s plus noise of 0.03 (0.06 peak to peak); one middle line at 0.5: 5 output flips; two lines at 0.4 and 0.6 (gap 0.2, wider than the noise): 1 flip. The thermostat half uses the same shape in degrees: one line at 20, or lines at 19 and 21.

Times are planned (about 3 words per second, video 72.6 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Your heater never clicks twice a SECOND. Why not? | Board lands (entrance) already in the hook state, so frame 0 moves. No figure exists yet. New slug, for example <code>schmitt-thermostat</code>. A room corner on the board: a wall heater (isometric, with a small white LED strip that glows when it is on) and a round wall thermostat beside it (backlit light-blue LCD screen, JetBrains Mono digits, one ROLLIN maker's plate under it). A small click mark appears beside the heater each time it switches. Below the board: one readout, a temperature graph against time (Oxanium), with two dashed lines at 19 and 21 and a faint line at 20, and a click counter. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Your heater"): the heater glows on; the temperature rises slowly with a small wobble. 0.7 ("never clicks"): at 21 it clicks off once; the temperature drifts down with the same wobble; at 19 it clicks on once; the counter shows 1 click each way. 1.3 ("twice a SECOND"): a ghost fast clicking (on-off-on) flickers beside the heater for 0.5 s, then fades. | NOTE "1 click on, 1 click off" · on "never clicks" (0.7) · out "picture a heater" (7.9) · above right · tie arrow to the click counter · hook |
| **3.3-7.3 s** The room wobbles all the time. So why doesn't your heater click? | 3.6 ("room wobbles"): the graph's small wobble pulses. 6.3 ("your heater click"): the heater pulses. Then the graph and counter clear. | PEN wave · on "wobbles all the time" (4.0) · beside the graph's wobbly line · out "picture a heater" (7.9)<br>NOTE "wobble: about half a degree" · on "your heater click" (6.3) · out "one line" (9.3) · below left · tie arrow to the graph's wobble |
| **7.6-11.6 s** [warmly] See, picture a heater with one line: on below twenty, off above. | 9.3 ("one line"): the 19 and 21 lines fade; only the 20 line stays, bold. 9.9 ("on below twenty"): the heater glows below the line. 10.9 ("off above"): it switches off above the line (computed). | NOTE "one line: 20" · on "one line" (9.3) · out "two lines instead" (18.5) · above left · tie arrow to the 20 line |
| **11.9-16.2 s** Near twenty, the room wobbles. The heater clicks on, off, on, off, on. | 11.9 ("Near twenty"): the temperature creeps up to 20 with its wobble. 12.6 ("the room wobbles"): the line is crossed again and again. 14.6 ("on, off, on, off, on"): the heater clicks on each spoken word; the counter rolls to 5 (computed: 5 crossings). | NOTE "5 clicks in a few seconds" · on "on, off, on" (14.6) · out "two lines instead" (18.5) · below left · tie arrow to the click counter |
| **16.5-21.5 s** Here's the trick. Your thermostat uses two lines instead: on at nineteen, off at twenty-one. | 18.5 ("two lines instead"): the 20 line fades; the 19 and 21 lines draw in, bold. 19.5 ("on at nineteen"): the 19 line pulses. 20.5 ("off at twenty-one"): the 21 line pulses. | PEN box · on "two lines instead" (18.5) · round the 19 and 21 lines · out "Two lines, a gap" (24.8)<br>NOTE "gap: 2 degrees" · on "on at nineteen" (19.5) · out "Two lines, a gap" (24.8) · outside the box · tie box |
| **21.8-24.5 s** A small wobble near twenty crosses neither line. | 21.8 ("A small wobble"): the counter resets; the same wobbly rise plays again. 23.5 ("crosses neither line"): the wobble stays between 19 and 21; the heater stays on until 21, one click (computed). | NOTE "1 click, not 5" · on "crosses neither line" (23.5) · out fold (30.4) · below left · tie arrow to the click counter |
| **24.8-30.1 s** [thoughtful] Two lines, a gap between, no chatter. Let's understand this in episode twenty-nine of chip design. | 25.5 ("a gap between"): the band between 19 and 21 shades pale. Steady hold. | NOTE "Episode 29" · on "episode twenty-nine" (28.5) · out end · top right · tie none · badge |
| **30.4-32.4 s** [pause] Now, the same with bits. | Fold (each part changes in turn, 0.3 s apart): the board becomes the digital electronics CMOS board (VDD rail at the back, GND rail at the front, both engraved). The heater becomes an inverter (blue PMOS over red NMOS) with an output lamp; the thermostat's sensor becomes its input wire, coming from the left as a slow noisy signal (a small rust wobble riding on it); the output wire runs to a counter of output flips. The temperature graph becomes a DE-style graph with two rows: input (0 to 1, a dashed middle line at 0.5) and output. | Nothing new. |
| **32.7-37.0 s** The heater becomes an inverter. The temperature, its input: a slow, noisy wire. | 33.4 ("becomes an inverter"): a ghost heater shows over the inverter and melts into it. 35.0 ("its input"): the input wire flashes. 36.0 ("slow, noisy"): the input row draws a slow ramp with a small wobble. | NOTE "input rises slowly, with noise" · on "slow, noisy" (36.0) · out "one middle line" (38.6) · above left · tie arrow to the input wire |
| **37.3-42.6 s** A normal inverter has one middle line. Near it, noise flips the output again and again. | 38.6 ("one middle line"): the dashed 0.5 line pulses. 39.6 ("Near it"): the ramp reaches 0.5 with its wobble. 40.6 ("flips the output"): the output row jumps 1-0-1-0-1; the lamp flickers; the flip counter rolls to 5 (computed: 5 crossings). | NOTE "one line: 0.5" · on "one middle line" (38.6) · out "Five flips" (44.6) · above right · tie arrow to the dashed line |
| **42.9-48.6 s** Just one flip, right? Nope. Five flips for one slow edge. The next gate sees them all. | 43.2 ("one flip, right"): a ghost single step shows on the output row. 44.2 ("Nope"): it fades. 44.6 ("Five flips"): the five output steps pulse in turn. 47.6 ("sees them all"): a small next gate at the right flickers five times; red dashed warning outline round the output row. | PEN ring · on "Five flips" (44.6) · round the five output steps · out "A Schmitt trigger" (48.9)<br>NOTE "1 edge in, 5 edges out" · on "The next gate" (46.6) · out "two lines" (50.2) · below left · tie arrow to the next gate |
| **48.9-52.9 s** A Schmitt trigger has two lines: high for rising, low for falling. | 48.9 ("A Schmitt trigger"): the inverter's symbol gains the small hysteresis loop mark; it is now a Schmitt trigger (plate engraved). 50.2 ("two lines"): the 0.5 line fades; lines at 0.6 (high) and 0.4 (low) draw in. 50.9 ("high for rising"): the 0.6 line pulses. 51.9 ("low for falling"): the 0.4 line pulses. | NOTE "high 0.6, low 0.4" · on "two lines" (50.2) · out "just ONCE" (55.9) · above left · tie arrow to the two lines |
| **53.2-56.5 s** [slightly excited] The same noisy edge now flips the output just ONCE. | Key state. 53.2 ("The same noisy edge"): the counter resets; the same wobbly ramp replays. 54.9 ("flips the output"): the input crosses 0.6 once; the output steps once; the wobble near 0.5 changes nothing. 55.9 ("just ONCE"): the flip counter shows 1 (computed: 1 flip with lines at 0.4 and 0.6). The single step and the counter at 1 hold through the next row (the longest hold). | PEN ring · on "just ONCE" (55.9) · round the single output step · out "Two lines and" (60.8) · key<br>NOTE "wobble near 0.5: ignored" · on "flips the output" (54.9) · out "hysteresis" (58.5) · below left · tie arrow to the input wobble |
| **56.8-60.5 s** Basically, that gap is called hysteresis. It's wider than the wobble. | 57.1 ("that gap"): the band between 0.4 and 0.6 shades pale. 58.5 ("hysteresis"): its label engraves. 59.1 ("wider than the wobble"): a small bracket shows the noise's height inside the band, smaller than the band. | NOTE "gap 0.2 > noise 0.06" · on "wider than the wobble" (59.1) · out fold (64.1) · below right · tie arrow to the bracket |
| **60.8-63.8 s** [thoughtful] Two lines and a gap: one click, no chatter. | 62.5 ("one click"): a ghost heater beside the Schmitt trigger clicks once. | Nothing new. |
| **64.1-72.6 s** [confident] Two lines, so your heater never chatters. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 64.1-65.7 fold back: the Schmitt trigger becomes the heater, the input wire the thermostat's sensor, the graph the temperature graph with its 19 and 21 lines (the start frame: heater on, temperature rising slowly). Held to the end. Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "two lines stop the chatter" · at end-4 (68.6) · out end · end card · tie box |

## Caption

1 noisy edge: 5 flips in a plain gate, 1 in a Schmitt trigger.

#chipdesign #vlsi #semiconductors #computerarchitecture #aihardware
