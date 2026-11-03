---
name: htmlmp4
description: Build one episode's HTML figure and finished reel MP4 from its Notion page and the recorded voiceover. Use when the user types /htmlmp4 with a series and episode number (and the mp3), e.g. "/htmlmp4 chip 17 D:/Downloads/ElevenLabs_….mp3", "/htmlmp4 de 9", or asks to build the html and mp4 for an episode after the voiceover.
argument-hint: "<chip | de | verilog> <N> [voiceover mp3]"
---

# /htmlmp4: Notion page + voiceover in, HTML and reel out

Arguments: `$ARGUMENTS` (series, episode number, path to the mp3; no series = chip design). The episode's Notion page (written by `/script`, layout of `script-writer/example/ep13-decoder.md`) is the baseline: **On the board** is the figure brief, **Annotation** is the exact list of marks to draw. Do the steps in order. CLAUDE.md rules apply throughout (edit in place, short replies, no git, check frames on paper).

**Two sources of truth, read fresh on every run (owner, 2026-11-03):**
- **What to show = the Notion page, fetched now.** Never build from an older saved `NN.page.md`, memory, the README/HANDOFF change lists, an earlier chat, or what the figure already does. If the page and the figure disagree, the page wins; the change list comes from `page-diff.py` (step 2), not from recollection.
- **When to show it = the recorded voice.** Every figure event and every mark is timed from the spoken words in `NN.words.json` (`annotations.mjs board` and `plan`). The page's seconds are planning numbers only; never copy them into a timeline.
- Words on the figure (labels, tags, state words, ghost text) use the page's words; a word the page changed (ep 11: wobble → shake) changes on the figure too.
- Anything the page asks for that cannot be built, or a cue the recording does not say, is reported to the owner, never guessed or silently dropped.

## 1. Load the rules

Run this skill in a fresh chat, not after `/script` in the same one (token budget, owner 2026-11-02): the Notion page and the files below carry everything it needs.

Read `rules/notes.md`, `builds/notes/README.md`, `script-writer/ANNOTATIONS.md`, and SCRIPTS.md sections 6 and 9. Chip-design: also `rules/chip-design.md`. Read `.claude/commands/new-figure.md` (and the `rules/` files it names) only if step 3 must build or change a figure.

## 2. Read the episode page from Notion

- Find the row as `/script` does (its SKILL.md section 2 table: chip-design `collection://34fc9dbf-37af-4377-b5f2-a48a2a84515c`, else search by database name). No row, or Notion not connected: say so and stop.
- Fetch the page and save its content (the part inside `<content>`) as `builds/notes/episodes/<dir>/NN.page.md` (`<dir>` = `chip-design/` for chip, none for DE as in the existing files). This copy is what every later check and the sign-off read. Always re-fetch, even when a copy exists: if one does, first rename it to `NN.page.prev.md` (the version the figure was last built from).
- **Change list:** with a `NN.page.prev.md`, run `python script-writer/page-diff.py <NN.page.prev.md> <NN.page.md>`. Every change it prints (voice, On the board, Annotation, caption) goes into step 3 or step 6, or is reported to the owner with the reason; none is skipped. With no previous copy and an existing figure, the change list is the full On the board column checked event by event against the figure.
- Run `python script-writer/check-page.py <page.md>` and `python script-writer/check-annotations.py <page.md> --series <s>`. Both must PASS. On FAIL: list the errors and stop; the page is fixed with `/script`, never here.
- Episode folder: `shorts/<series>/NN <interview question>/` (question from the CSV row).

## 3. HTML figure

- **Figure exists** (slug in `series/reel-builds.csv`, memory chip-design-progress, or `src/figures/<slug>/`): compare it with On the board. Change only what the page asks for that the figure does not show (CLAUDE.md section 1). Run its build.
- **Revised page, figure built on an older take** (`series/reel-builds.csv` Status `script revised: re-record, rebuild`; the README handover lists what changed per episode): never rebuild the figure. First do the re-take map (step 5, once the new mp3 is transcribed), then add every change in the step 2 change list (row 1 `Visual hook:` events, changed board events and cue words, renamed words on the figure), written into the figure's own timeline in old-take seconds (the `notes:retake` gap list says which old-take span each new line plays over). Leave every other event alone; the map moves them to the new take.
- **Figure in the taps world** (water rig + CMOS inverter, episodes 18 onward): start from the kit (`src/iso/taps/README.md`); skip the two-panel sample when only config changes (parts on or off, timeline, model numbers, readouts).
- **No figure yet:** follow `/new-figure` with the On the board column as the spec source: chip-design two-panel still sample first (analogy start frame and circuit key-state frame, DE circuit design), then the short spec, both stopping for the owner's OK (the owner's own rule; never skip). Then the figure-builder agent builds it.
- **Token budget (owner, 2026-11-02):** Opus only for the figure-builder; Sonnet for the blind viewer and other checking agents. Give each builder the brief once with every known fix batched (from the sample review, the spec and anything you noticed), so one fix round is the norm; a second round only when the owner asks, never a third. Render check frames at scale 0.5 and 10 fps from a copy. Keep a builder alive with SendMessage for fixes rather than starting a new one, unless its context is already very large. Small fixes (a size, a width, a position, a colour, a timing number) you make directly in the figure's files, without a builder.
- **The owner is the visual reviewer:** the builder renders one frame per sample panel and, after the full build, looks at no more than 3 frames itself (fold, key state, loop end). You send the owner one contact sheet of 8-12 key seconds (`npm run notes:sheet`, scale 0.4) instead of re-rendering and re-checking frames with agents; the owner's OK or batched comments replace a self-review loop.
- Done when the build passes and the page loops. Set the Notion row's `Html` checkbox to Yes.
- **No mp3 given:** stop here and ask for the voiceover (memory book-series-workflow: no timing or annotations before the voice exists).

## 4. Voiceover

1. Copy the mp3 into the episode folder (keep its ElevenLabs name).
2. `npm run notes:transcribe -- "<mp3>" builds/notes/episodes/<dir>/NN.words.json`. **Re-take:** this overwrites the old take's transcript, which the re-take map needs: it must already be saved as `NN.old.words.json` (done for chip-design 11-18; for any other episode copy it first).
3. Compare the transcript with the page's voice block, word by word. Report differences in one line each (the recording wins for timing; a changed or dropped phrase that an annotation quotes is reported in step 6).
4. `node builds/notes/annotations.mjs board <page.md> <words.json>` lists every On the board event (`12.3 ("cue words"): what happens`) at the time its words are spoken in this recording. This list is the figure's timeline for step 5. It exits 1 and prints `??` for a cue the recording does not say: report those (the take differs from the page) before building; never time them by guess. Events spoken before 1.6 s play from 1.6 s, in the page's order, 0.4 s apart, once the landing has settled (the list prints when); the hook note carries those words on time from frame 0 (SCRIPTS.md section 4, visual hook).

## 5. Time-scale the figure to the voice

- **Shortcut:** when the figure is built after the recording and the page's times are already the recorded times, build the figure straight on the voice timing (figure time = voice time, as episodes 14, 15 and 17) and skip `voice.ts`.

- **Re-take (figure built on an older take):** `npm run notes:retake -- builds/notes/episodes/<dir>/NN.old.words.json builds/notes/episodes/<dir>/NN.words.json --write <slug>`. It aligns the two transcripts word by word and writes the voice page: `src/figures/<slug>/voice.ts` (the new `LOOP` and a `RETAKE` map, new take time → old take time; an existing `voice.ts` is kept as `voice-take1.ts` and composed), plus `src/main-<slug>-voice.tsx` and `builds/build-<slug>-voice.mjs` when missing (same output file). Build with `node builds/build-<slug>-voice.mjs`. It prints the spans spoken in only one take: the new ones are where the revised page's new events go (step 3), the dropped ones are squeezed. Every figure from 11 to 18 already has the `setTimeMap` hook in `live.tsx`. Then check one sheet at the hook, the fold, the key state and the loop end.
- Copy the voice-page pattern of the closest figure (`src/figures/parity-wash/voice.ts`, `builds/build-parity-wash-voice.mjs`, its `build:<slug>-voice` npm script): `ANCHORS` of `[voice s, figure s]`, one per On the board cue word, with the voice time taken from the step 4 `board` list (never from the page's planned seconds). Flat stretches hold a state while the voice explains; the key state gets the longest hold.
- `LOOP` = last word end + about 1 s, minus the 3 s entrance, so the end card has its 4 s and the loop still ends on its start frame.
- Build it to `<question> (<analogy>, voice).html`. Look at one sheet (`npm run notes:sheet`) at the fold, the key state and the loop end; each event must land on its words (SCRIPTS.md section 6).

## 6. Write the annotations exactly as planned

1. `node builds/notes/annotations.mjs plan <page.md> <words.json>` prints every planned mark with its time from the recording. It matches the page's words in Whisper's spelling (numbers as digits, "58" for "fifty-eight", "103" for "a hundred and three"; "P" + "moss"; "tri" + "-state"; "VDD" for "V D D"), so a WARN means the words really differ. A mark whose quoted words were not found is re-anchored to the nearest equivalent words and reported; never invent or reword a mark.
2. Write `builds/notes/episodes/<dir>/NN.mjs` fresh from the plan (a re-take never patches the old take's cue file: its marks were planned for the old text), starting from the newest cue file of the series (chip-design: `episodes/chip-design/16.mjs`; slope-following boxes: `pbox` in `13.mjs`). One variant `notes`, `engrave: null` when the figure engraves ROLLIN itself.
   - **crowd:** set `crowd: { max: 4, gap: 1.0 }` (ANNOTATIONS.md section 4, DE 01-02 density).
   - **Cold open:** the hook note starts writing on frame 0 (start 0.0, written out over about 1.3 s) in the top zone above the board; its CAPS underline (`PEN underline · on "<CAPS>" · under "<word of the hook note>"`) draws under that word of the hook note on the spoken CAPS word; `plan` already gives both these times. Every other mark waits for 1.6 s (SCRIPTS.md section 4, visual hook).
   - **NOTE:** words exactly as on the page (a long note may be split into 2-3 lines of one `group`); size 42-48 (hook 64-84); start = resolved time + 0.2 s, + 0.3 s more when its tie is drawn first; duration about 0.045 s per letter (0.25-1.4 s); wipe = resolved out time (`fold`: 0.15 s before the fold starts; `end`: `END`).
   - **tie:** `arrow to PART` → `arrow()` from beside the note, tip 10-15 px short of the part; `underline` → `line()` or `wave()` 50-60 % of the font size below; `box` → the note sits just outside its PEN box. The tie starts on the resolved time and wipes with the note.
   - **PEN:** `ring`, `box`/`pbox`, `arrow`, `underline` (`line`), `wave`, `tick`, `cross`, `glass`, `bulb`, `squiggle` from `builds/notes/pen.mjs`; starts on the resolved time; rings and boxes only once the part has settled.
   - **Place:** the page's place word picks the zone (README section 4: above the board y 300-760, below 1200-1500, badge top right y about 330, end card takeaway boxed at y about 1408 with "Episode N+1 →" at y about 1693, `{ alive: true }`, 1.5 s after the takeaway). Measure before writing (token budget: one placement pass, not a guess-and-check loop): `node builds/notes/labels.mjs "<page>" <secs>` prints every text label's box (what R3/R5 protect) at the phase's key seconds, and one sheet at those seconds gives the parts; write the cue from those numbers, arrow tips 15 px clear of parts and labels (memory pen-marks-check). Then `node builds/notes/autoplace.mjs builds/notes/episodes/<dir>/NN.mjs --write`: it moves only the notes and tie arrows that would fail R1-R6, within their planned side of the part, and prints what it moved and anything it could not fit (fix those by hand, within the planned place).
3. `npm run notes -- <dir>/NN`, then `npm run notes:check -- "<notes page>"`. Fix every hit by moving the mark within its planned place; if it only fits in another place, with other words or at another time, report it to the owner instead of changing the plan.
4. One sheet at every new mark's second (cropped, scale 0.5): each mark reads at phone size, points at the right part, nothing is crowded.

## 6b. Understanding test on the annotated reel (required, before the sign-off)

Follow `script-writer/UNDERSTANDING-TEST.md` (video stage); the notes are part of what viewers see, so the test runs on the notes page:
1. `node builds/notes/heard.mjs <words.json> 3.5` prints the frame seconds (one every 3.5 s) and the words heard at each.
2. Render those seconds from the notes page with `npm run notes:sheet -- "<notes page>" <secs> --cols 5 --scale 0.3`, about 10 seconds per sheet; copy each `builds/notes/.check/sheet.png` to the scratchpad as `watch-1.png`, `watch-2.png`, … before the next batch.
3. One fresh blind viewer agent (general-purpose, Sonnet) gets the sheets and the heard lines with the 15-year-old analogy prompt, word for word; only after it has answered, send it the first-year BTech circuit prompt, word for word, with SendMessage (circuit-only reels: the BTech prompt only). The main session then grades both answers with letters A-H (UNDERSTANDING-TEST.md section 3), checking each claim against the viewer's actual words; no grader agent. **One run per episode** (UNDERSTANDING-TEST.md budget).
4. PASS: go on. FAIL only on pacing, size or visibility (D, H, WARNs: too fast, too small, too faint, a number that disagrees with the voice): make those fixes in the figure or the cue file in the same round, re-run `notes:check` and the signoff, and go on without a retest; list the fixes in the sign-off lines. FAIL on understanding (A-C, E-G: the why, the click, the parts, the mechanism, the mapping): report to the owner the lost seconds, the viewer's two answers and the fixes from the grading, and stop before the export; the owner decides between a fix plus one retest with a new agent, a fix without a retest, or a story fix back in `/script`.

## 7. Final sign-off (all must PASS before export)

1. `python script-writer/check-annotations.py <page.md> --series <s>`: the plan itself.
1b. `node builds/notes/annotations.mjs board <page.md> <words.json>`: exit 0 (every board cue spoken), and every change from the step 2 change list is either in the figure or in the report.
2. `node builds/notes/annotations.mjs signoff <page.md> <words.json> builds/notes/episodes/<dir>/NN.mjs`: every planned mark is built with the same words, starts 0-0.5 s after its spoken words (1 s with a tie), wipes as planned, every tie is drawn, and no unplanned note was added.
3. `npm run notes:check -- "<notes page>"`: R1-R8 overlaps and crowding.

Show the owner one line per check (PASS or the errors), plus the step 6b understanding test result. Only when all of them pass is the reel signed off.

## 8. Export and log

- **One export only:** before exporting, send the owner one contact sheet of the annotated reel (`npm run notes:sheet` at about 12 key seconds, scale 0.4) with the sign-off lines; export on their OK. An export takes about 10 minutes, so it runs once, after the owner has seen the key frames.

- `npm run notes:export -- "<notes page>" --audio "<mp3>"`, then rename the MP4 with the number prefix (`NN_<question> (reel).mp4`, as for episodes 13-16).
- Update the episode's row in `series/reel-builds.csv` (all file columns, Status `reel exported`, date, one line of notes).
- Reply in at most 5 lines: files written, the sign-off result, transcript differences, anything reported instead of changed, and the seconds to look at on screen.
