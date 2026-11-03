```txt
[confident] Handle exactly halfway, yet the tank stays almost EMPTY.

So why does a halfway handle leave the tank empty? Let's watch.

[warmly] The handle works two taps: as one opens, the other shuts. The top tap pours from a high tank; the bottom one drains.

Halfway, both taps run. The level settles where in equals out.

But the top pipe is narrower: the drain wins. Widen it: halfway means half full.

[thoughtful] A weak tap needs a wider pipe. Let's understand this in episode sixteen of chip design.

[pause] Now, the same with bits.

The handle is the input, the level the output. The top tap is a P-moss, the bottom an N-moss.

Halfway, both are on: the output sits low.

But the P-moss is the narrower pipe. Its charges, called holes, move slower than electrons. So the output flips to empty before the input reaches half.

[slightly excited] Make the P-moss two and a half times WIDER, and it flips at half. That point is the switching threshold.

Then zero and one get equal room for noise, and equal speed.

[thoughtful] That's why the P-moss is built wider.

[curious] That high tank is the supply voltage. What if it sat half as high? That's episode seventeen.
```

**ElevenLabs:** Eleven v3 (same voice), stability Creative or Natural, 2-3 takes. 200 words (<code>check-voice.py</code>: PASS), about 74 s planned; voice speed about 1.05. "P-moss" and "N-moss" are spelt as they sound; keep them as written.

Times are planned (about 3 words per second, video 73.7 s); redo them from the recording. Notes: Samble, brown-black #2a1d10; pen marks olive #4f5d24. Annotations follow `script-writer/ANNOTATIONS.md` (one mark per line; times re-resolve from the quoted words in the recording). `check-annotations.py`: PASS.

| ElevenLabs script | On the board | Annotation |
| --- | --- | --- |
| **0.0-2.9 s** [confident] Handle exactly halfway, yet the tank stays almost EMPTY. | Board lands (entrance) in the hook state: a high tank on a stand (top left, one ROLLIN maker's plate on it), a narrow fill pipe down to the top (fill) tap, a glass tank (middle) with a half mark, a bottom (drain) tap with a wider pipe, one handle (left) linked by a rod to both tap wheels. Handle at its middle mark, both blue streams running, level near the bottom (computed, about 5 %). New slug `switching-threshold-taps`, copied from `cmos-inverter-taps` and `wider-is-faster-pipes`. 2.3 ("EMPTY"): the almost-empty level pulses once. | NOTE "expected: half full" · on "EMPTY" (2.3) · out "The handle works" (7.4) · above left · tie arrow to the tank's half mark · hook |
| **3.2-7.1 s** So why does a halfway handle leave the tank empty? Let's watch. | 4.6 ("halfway handle"): the handle pulses at its middle mark; both streams run; the level holds almost empty. 6.4 ("Let's watch"): the handle wiggles once at the middle mark. | Nothing new. |
| **7.4-10.9 s** [warmly] The handle works two taps: as one opens, the other shuts. | 7.4 ("The handle"): the handle swings to the drain end; the top tap shuts, the bottom opens; the tank empties. 9.2 ("as one opens"): the handle swings to the fill end; the top wheel turns open while the bottom wheel turns shut, together (the linkage rod moves visibly). | PEN arrow · on "two taps" (8.0) · to the linkage rod · out "The top tap pours" (11.2) |
| **11.2-15.1 s** The top tap pours from a high tank; the bottom one drains. | 11.2 ("The top tap pours"): water falls from the high tank through the narrow pipe; the tank fills, slowly (computed). 12.6 ("high tank"): the high tank's level dips a little. 13.4 ("the bottom one drains"): the handle swings to the drain end; the top tap shuts first, the tank drains fast. | Nothing new. |
| **15.4-18.9 s** Halfway, both taps run. The level settles where in equals out. | 15.4 ("Halfway"): the handle moves to its middle mark. 15.9 ("both taps run"): both streams run. 16.4-18.5 ("The level settles"): the level rises a little and stops low; the in and out flow arrows grow to the same length on "in equals out". | NOTE "stuck near empty" · on "The level settles" (16.4) · out "Widen it" (22.4) · above right · tie arrow to the low level |
| **19.2-22.1 s** But the top pipe is narrower: the drain wins. | 19.8 ("top pipe"): the narrow fill pipe glows once. 21.5 ("the drain wins"): the low level pulses; the drain stream stays strong. | PEN ring · on "narrower" (20.8) · round the narrow fill pipe · out "half full" (24.1) |
| **22.4-24.4 s** Widen it: halfway means half full. | 22.4 ("Widen it"): the fill pipe widens 1 to 2.5x (0.8 s). 23.2-24.4: the level rises and settles exactly on the half mark on "half full". | NOTE "top pipe 2.5x wider" · on "Widen it" (22.4) · out "wider pipe" (26.5) · below left · tie arrow to the wide fill pipe<br>PEN tick · on "half full" (24.1) · beside the half mark · out "episode sixteen" (28.2) |
| **24.7-29.8 s** [thoughtful] A weak tap needs a wider pipe. Let's understand this in episode sixteen of chip design. | Steady hold: handle halfway, tank half full, both streams equal. 25.6 ("weak tap"): the top tap pulses once; 26.5 ("wider pipe"): the wide fill pipe pulses once. | NOTE "Episode 16" · on "episode sixteen" (28.2) · out end · top right · tie none · badge |
| **30.5-32.2 s** [pause] Now, the same with bits. | Fold: the high tank becomes the V D D rail, the drain the GND rail, the top tap a blue P-moss valve, the bottom tap a red N-moss valve, the handle the input lever, the glass tank the output tank; water turns rust. The P-moss resets to the same width as the N-moss; the lever goes to 0 (output full). | Nothing new. |
| **32.5-35.4 s** The handle is the input, the level the output. | 32.8 ("The handle"): the lever pulses; readout "Vin 0.00 V" appears. 34.7 ("the output"): the output tank pulses; readout "Vout 1.00 V" appears. Readouts below the board: Vin, Vout, and a small graph of Vout against Vin with a half mark. | Nothing new. |
| **35.7-38.9 s** The top tap is a P-moss, the bottom an N-moss. | 36.9 ("P-moss"): the P-moss gate bar flashes blue. 38.2 ("N-moss"): the N-moss gate bar flashes red. | NOTE "transistor = an electric tap" · on "P-moss" (36.9) · out "sits low" (40.6) · above left · tie arrow to the P-moss valve |
| **39.2-41.8 s** Halfway, both are on: the output sits low. | 39.2 ("Halfway"): the lever moves to 0.50 V (readout). 39.8 ("both are on"): both gate bars lit; both straps turn rust, dashes run supply to tank to ground. 40.6 ("the output sits low"): the output level falls and stops at 0.05 V (readout "Vout 0.05 V", computed); the dashes in both straps then run at the same pace (in equals out). | NOTE "should be 0.50 V" · on "sits low" (40.6) · out "called holes" (44.9) · above right · tie arrow to the Vout readout |
| **42.1-44.3 s** But the P-moss is the narrower pipe. | 42.7 ("P-moss"): the P-moss body glows blue once. 43.7 ("narrower pipe"): a thin outline of the water scene's narrow pipe flashes over the P-moss for 0.6 s. | Nothing new. |
| **44.6-47.2 s** Its charges, called holes, move slower than electrons. | 44.8 ("Its charges"): small dots appear inside both valves. 44.9 ("called holes"): the P-moss dots are hollow rings and crawl. 46.6 ("electrons"): the N-moss dots are solid and run 2.5x faster. | NOTE "hole = missing electron" · on "called holes" (44.9) · out "reaches half" (50.6) · above left · tie arrow to the P-moss dots |
| **47.5-51.1 s** So the output flips to empty before the input reaches half. | 47.5 ("So the output"): the lever snaps to 0; the output refills to 1 V; the graph clears. 47.9-50.9: the lever sweeps slowly up while the graph traces the curve (computed). 48.2 ("flips to empty"): at Vin 0.45 V the output falls from 1 V to near 0 at once. 50.6 ("reaches half"): the lever reaches the half mark, the output already low; a faint dashed line marks 0.5 on the graph. | NOTE "flips at 0.45 V" · on "flips to empty" (48.2) · out "WIDER" (54.6) · above right · tie arrow to the curve's drop |
| **51.4-55.9 s** [slightly excited] Make the P-moss two and a half times WIDER, and it flips at half. | 51.4 ("Make the P-moss"): the lever returns to 0 and the output refills. 52.0-54.6: the P-moss block widens to 2.5x (label "W x2.5" lit), finishing on "WIDER". 54.9-56.0 ("and it flips at half"): the lever sweeps up again; the second curve falls exactly at 0.5; the output crosses half on "half". | NOTE "now flips at 0.50 V" · on "and it flips" (55.0) · out "room for noise" (61.2) · above right · tie arrow to the second curve |
| **56.2-59.7 s** That point is the switching threshold. | Key state, held 55.9-59.7 s (the longest hold): lever 0.50 V, output 0.50 V, both straps equal. 57.2 ("switching threshold"): a "VM" tick grows on the graph at 0.5. Computed in the model: square-law currents, V D D 1 V, threshold 0.3 V, electrons 2.5x more mobile than holes, lambda 0.05; the level moves at (fill - drain) / C, and the same numbers drive water, straps, readouts and graph. Same size: VM 0.455 V, Vout at Vin 0.5 = 0.05 V. P-moss 2.5x wider: VM 0.500 V, Vout at Vin 0.5 = 0.50 V. The handle must stop exactly on the half mark (the curve is steep there). | PEN ring · on "switching threshold" (57.2) · round the VM tick · out "equal speed" (63.2) · key<br>NOTE "VM = input at half output" · on "switching threshold" (57.4) · out "equal speed" (63.2) · above left · tie arrow to the VM tick |
| **60.0-63.9 s** Then zero and one get equal room for noise, and equal speed. | 61.2 ("room for noise"): two equal brackets grow on the graph's input axis, 0-0.5 and 0.5-1. 63.2 ("equal speed"): the lever steps to 1 (the output drains in about 1 s), then to 0 (it fills in the same time). | NOTE "0.5 V of room each side" · on "room for noise" (61.2) · out "built wider" (65.4) · above left · tie arrow to the two brackets |
| **64.2-66.4 s** [thoughtful] That's why the P-moss is built wider. | 65.0 ("P-moss"): the wide P-moss block pulses once. | Nothing new. |
| **66.7-73.7 s** [curious] That high tank is the supply voltage. What if it sat half as high? That's episode seventeen. | 66.7-68.2 fold back to the water start frame: the V D D rail becomes the high tank, the P-moss the narrow fill tap, the N-moss the drain tap, the lever the handle at its middle mark, the level low. 67.3 ("high tank"): the high tank glows. 68.3 ("supply voltage"): a faint V D D label shows on the high tank for 1 s. 69.6 ("half as high"): a faint dashed ghost of the high tank at half its height shows for 1.5 s, then fades. Held to 73.7 s (the start frame). | NOTE "slow holes need a wider P-moss" · at end-4 (69.7) · out end · end card · tie box |
