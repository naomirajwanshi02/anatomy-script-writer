```txt
[confident] Handle at half, but your tank won't fill HALF.

Halfway handle, half full tank, right? Nope.

[warmly] See, the handle works two taps: one opens, the other shuts. The top tap pours from a high tank; the bottom one drains.

Halfway, both taps run. The level settles where in equals out.

Here's the catch. The top pipe is narrower, so the drain wins. Widen it: halfway means half full.

[thoughtful] A weak tap needs a wider pipe. Let's understand this in episode sixteen of chip design.

[pause] Now, the same with bits.

The handle is the input, the level the output. The top tap is a P-moss, the bottom an N-moss.

Halfway, both are on. The output? It sits low.

But the P-moss is the narrower pipe. Because its charges, called holes, move slower than electrons. So the output flips to empty before the input reaches half.

[slightly excited] Make the P-moss two and a half times WIDER. Now it flips at half. That point? The switching threshold.

Zero and one get equal room for noise, and equal speed.

[thoughtful] Basically, that's why the P-moss is built wider.

[confident] Wide pipe, half full.

[pause] [playfully] Now you can explain what most engineers can't.

[warmly] Follow, and keep it that way.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 67 s planned; voice speed about 1.05. "P-moss" and "N-moss" are spelt as they sound; keep them as written.

Times are planned (about 3 words per second, video 74.3 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow <code>script-writer/ANNOTATIONS.md</code> (one mark per line; times re-resolve from the quoted words in the recording). <code>check-annotations.py</code>: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-3.0 s** [confident] Handle at half, but your tank won't fill HALF. | Board lands (entrance) in the hook state, both streams already running while it lands: a high tank on a stand (top left, one ROLLIN maker's plate on it), a narrow fill pipe down to the top (fill) tap, a glass tank (middle) with a half mark, a bottom (drain) tap with a wider pipe, one handle (left) linked by a rod to both tap wheels. Handle at its middle mark, both blue streams running, level near the bottom (computed, about 5 %). New slug <code>switching-threshold-taps</code>, copied from <code>cmos-inverter-taps</code> and <code>wider-is-faster-pipes</code>. Cold open: from the first frame the hook note writes itself above the board while the board rises. Visual hook (board events spoken before 1.6 s play from 1.6 s, after the landing has settled, in this order, 0.4 s apart): 0.0 ("Handle at half"): the handle rocks onto its middle mark and the rod nudges both tap wheels (24 px). 1.3 ("your tank"): the glass tank outlines. 2.3 ("fill HALF"): a dashed ghost level flashes at the half mark while the real level sits near the bottom, the gap between them pulsing twice; then the ghost fades (the start frame). | NOTE "half handle, nearly empty tank" · on "Handle at half" (0.0) · out "The handle works" (6.2) · above right · tie arrow to the low level · hook<br>PEN underline · on "HALF" (0.7) · under "half" · out "The handle works" (6.2) |
| **3.3-5.6 s** Halfway handle, half full tank, right? Nope. | 3.3 ("Halfway handle"): the handle pulses at its middle mark; both streams run; the level holds almost empty. 5.3 ("Nope"): the handle wiggles once at the middle mark. | NOTE "expected: half full" · on "Halfway handle" (3.3) · out "The handle" (6.2) · below left · tie arrow to the half mark |
| **5.9-9.6 s** [warmly] See, the handle works two taps: one opens, the other shuts. | 6.2 ("The handle"): the handle swings to the drain end; the top tap shuts, the bottom opens; the tank empties. 7.9 ("one opens"): the handle swings to the fill end; the top wheel turns open while the bottom wheel turns shut, together (the linkage rod moves visibly). | PEN arrow · on "two taps" (7.2) · to the linkage rod · out "The top tap pours" (9.9) |
| **9.9-13.9 s** The top tap pours from a high tank; the bottom one drains. | 9.9 ("The top tap pours"): water falls from the high tank through the narrow pipe; the tank fills, slowly (computed). 11.9 ("high tank"): the high tank's level dips a little. 12.6 ("the bottom one drains"): the handle swings to the drain end; the top tap shuts first, the tank drains fast. | NOTE "high tank: a strong push in" · on "high tank" (11.9) · out "The level settles" (15.5) · above left · tie arrow to the high tank |
| **14.2-17.9 s** Halfway, both taps run. The level settles where in equals out. | 14.2 ("Halfway"): the handle moves to its middle mark. 14.5 ("both taps run"): both streams run. 15.5 ("The level settles"): the level rises a little and stops low; the in and out flow arrows grow to the same length on "in equals out". | NOTE "stuck near empty" · on "The level settles" (15.5) · out "Widen it" (22.5) · above right · tie arrow to the low level |
| **18.2-22.2 s** Here's the catch. The top pipe is narrower, so the drain wins. | 19.5 ("top pipe"): the narrow fill pipe glows once. 21.2 ("the drain wins"): the low level pulses; the drain stream stays strong. | PEN ring · on "narrower" (20.5) · round the narrow fill pipe · out "half full" (23.8) |
| **22.5-24.5 s** Widen it: halfway means half full. | 22.5 ("Widen it"): the fill pipe widens 1 to 2.5x (0.8 s). 23.3 ("Widen it" + 0.8 s): the level rises and settles exactly on the half mark on "half full". | NOTE "top pipe 2.5x wider" · on "Widen it" (22.5) · out "wider pipe" (26.5) · below left · tie arrow to the wide fill pipe<br>PEN tick · on "half full" (23.8) · beside the half mark · out "episode sixteen" (28.5) |
| **24.8-30.1 s** [thoughtful] A weak tap needs a wider pipe. Let's understand this in episode sixteen of chip design. | Steady hold: handle halfway, tank half full, both streams equal. 25.1 ("weak tap"): the top tap pulses once; 26.5 ("wider pipe"): the wide fill pipe pulses once. | NOTE "Episode 16" · on "episode sixteen" (28.5) · out end · top right · tie none · badge |
| **30.4-32.4 s** [pause] Now, the same with bits. | Fold: the high tank becomes the V D D rail, the drain the GND rail, the top tap a blue P-moss valve, the bottom tap a red N-moss valve, the handle the input lever, the glass tank the output tank; water turns rust. The P-moss resets to the same width as the N-moss; the lever goes to 0 (output full). | Nothing new. |
| **32.7-35.7 s** The handle is the input, the level the output. | 32.7 ("The handle"): the lever pulses; readout "Vin 0.00 V" appears. 35.0 ("the output"): the output tank pulses; readout "Vout 1.00 V" appears. Readouts below the board: Vin, Vout, and a small graph of Vout against Vin with a half mark. | Nothing new. |
| **36.0-39.3 s** The top tap is a P-moss, the bottom an N-moss. | 37.7 ("P-moss"): the P-moss gate bar flashes blue. 39.0 ("N-moss"): the N-moss gate bar flashes red. | NOTE "transistor = an electric tap" · on "P-moss" (37.7) · out "sits low" (41.9) · above left · tie arrow to the P-moss valve |
| **39.6-42.6 s** Halfway, both are on. The output? It sits low. | 39.6 ("Halfway"): the lever moves to 0.50 V (readout). 39.9 ("both are on"): both gate bars lit; both straps turn rust, dashes run supply to tank to ground. 41.6 ("It sits low"): the output level falls and stops at 0.05 V (readout "Vout 0.05 V", computed); the dashes in both straps then run at the same pace (in equals out). | NOTE "should flip at 50 %" · on "sits low" (41.9) · out "called holes" (46.5) · above right · tie arrow to the Vout readout |
| **42.9-45.2 s** But the P-moss is the narrower pipe. | 43.6 ("P-moss"): the P-moss body glows blue once. 44.6 ("narrower pipe"): a thin outline of the water scene's narrow pipe flashes over the P-moss for 0.6 s. | NOTE "holes: about 2.5x slower" · on "narrower pipe" (44.6) · out "WIDER" (55.5) · below left · tie arrow to the P-moss |
| **45.5-48.5 s** Because its charges, called holes, move slower than electrons. | 45.8 ("Its charges"): small dots appear inside both valves. 46.5 ("called holes"): the P-moss dots are hollow rings and crawl. 48.2 ("electrons"): the N-moss dots are solid and run 2.5x faster. | NOTE "hole = missing electron" · on "called holes" (46.5) · out "reaches half" (51.8) · above left · tie arrow to the P-moss dots |
| **48.8-52.5 s** So the output flips to empty before the input reaches half. | 48.8 ("So the output"): the lever snaps to 0; the output refills to 1 V; the graph clears. 49.2 ("So the" + 0.4 s): the lever sweeps slowly up while the graph traces the curve (computed). 49.8 ("flips to empty"): at Vin 0.45 V the output falls from 1 V to near 0 at once. 51.8 ("reaches half"): the lever reaches the half mark, the output already low; a faint dashed line marks 0.5 on the graph. | NOTE "flips at 45 %" · on "flips to empty" (49.8) · out "WIDER" (55.5) · above right · tie arrow to the curve's drop |
| **52.8-57.5 s** [slightly excited] Make the P-moss two and a half times WIDER. Now it flips at half. | 52.8 ("Make the P-moss"): the lever returns to 0 and the output refills. 53.4 ("Make the" + 0.6 s): the P-moss block widens to 2.5x (label "W x2.5" lit), finishing on "WIDER". 55.8 ("Now it flips at half"): the lever sweeps up again; the second curve falls exactly at 0.5; the output crosses half on "half". | NOTE "wider = stronger push" · on "Make the P-moss" (52.8) · out "switching threshold" (58.8) · above left · tie arrow to the P-moss valve<br>NOTE "now flips at 50 %" · on "it flips at" (56.1) · out "room for noise" (61.5) · above right · tie arrow to the second curve |
| **57.8-59.5 s** That point? The switching threshold. | Key state, held 55.9-59.7 s (the longest hold): lever 0.50 V, output 0.50 V, both straps equal. 58.8 ("switching threshold"): a "VM" tick grows on the graph at 0.5. Computed in the model: square-law currents, V D D 1 V, threshold 0.3 V, electrons 2.5x more mobile than holes, lambda 0.05; the level moves at (fill - drain) / C, and the same numbers drive water, straps, readouts and graph. Same size: VM 0.455 V, Vout at Vin 0.5 = 0.05 V. P-moss 2.5x wider: VM 0.500 V, Vout at Vin 0.5 = 0.50 V. The handle must stop exactly on the half mark (the curve is steep there). | PEN ring · on "switching threshold" (58.8) · round the VM tick · out "equal speed" (62.8) · key<br>NOTE "VM = input at half output" · on "switching threshold" (58.8) · out "equal speed" (62.8) · above left · tie arrow to the VM tick |
| **59.8-63.5 s** Zero and one get equal room for noise, and equal speed. | 61.5 ("room for noise"): two equal brackets grow on the graph's input axis, 0-0.5 and 0.5-1. 62.8 ("equal speed"): the lever steps to 1 (the output drains in about 1 s), then to 0 (it fills in the same time). | NOTE "equal room each side" · on "room for noise" (61.5) · out "built wider" (65.8) · above left · tie arrow to the two brackets |
| **63.8-66.5 s** [thoughtful] Basically, that's why the P-moss is built wider. | 65.1 ("P-moss"): the wide P-moss block pulses once. | Nothing new. |
| **66.8-74.3 s** [confident] Wide pipe, half full. [pause] [playfully] Now you can explain what most engineers can't. [warmly] Follow, and keep it that way. | 66.8-68.4 fold back to the water start frame: the V D D rail becomes the high tank, the P-moss the narrow fill tap, the N-moss the drain tap, the lever the handle at its middle mark, the level low; 66.8 ("Wide pipe"): a faint ghost of the wide fill pipe and a half-full level show for 1.5 s, then fade. Held to the end (the start frame). Sign-off on screen (iPad layer, nothing to build in the figure): the "1 : 0" scoreboard (olive 1, red 0) and "Follow" with its arrow, underlines and sparks, from <code>npm run notes:signoff</code>. | NOTE "slow holes need a wider P-moss" · at end-4 (70.3) · out end · end card · tie box |

## Caption

Why the pull-up transistor is built 2.5x wider than the pull-down one.

#chipdesign #vlsi #semiconductors #aichips #aihardware
