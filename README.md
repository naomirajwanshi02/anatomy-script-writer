# Handover: chip-design 11-18 and 21, and the reel kit update (2026-11-02)

For the desktop Claude session on the laptop (`D:/Anatomy`), which records the voices, builds the HTML figures and exports the reels. **Claude desktop: start with [`HANDOFF.md`](HANDOFF.md)** (the working checklist and the copy script); this page is the background.

- **Scripts:** the source of truth for every episode is its Notion page in `book-concepts.csv` (Shorts). The same pages are backed up here in `scripts/`. Each page holds three things: the voice block to record, the **On the board** column (the figure brief) and the **Annotation** column (what `/htmlmp4` draws).
- **Reel kit:** this repo is now the full reel kit (the `reel-kit.zip` of 2026-11-02) with the updates in section 4. Built pages, voice files, videos, `node_modules`, `.tools` and the Samble font files are not in it; keep your local ones.
- Notion handover page with the script part: <https://app.notion.com/p/40ce67c0c52481c4b841eabdb12283ae>

## 0. Apply this update to `D:/Anatomy` (once)

Copy the files listed in section 6 from this repo into `D:/Anatomy` at the same paths, overwriting the old ones. Everything else in your folder stays as it is. No `npm install` is needed (`package.json` only gains the `notes:retake` script). Then `/htmlmp4` per episode, in a new chat each time.

## 1. Scripts: what changed and why

- Episodes 11-18 and 21 were scored with the script-writer tools and fixed where they scored low. Facts, analogies, worked numbers and circuit claims are unchanged.
- Every episode got:
  - a new hook, all scoring 80+ STRONG on `script-writer/ig/hookscore.py`, with the Hook title updated in Notion and in `series/book-concepts.csv`;
  - a second line that takes up the hook;
  - lines over 4 s split;
  - a teaser that echoes a hook word, so the reel loops;
  - a caption whose first line has a number.
- Every page passes `check-voice.py`, `check-page.py` and `check-annotations.py`. The hook score total over 11-18 went from 340 to 705.6 out of 800.
- 11 and 12 moved from the old four-section page to the current layout (voice block, 3-column table, NOTE/PEN annotations, caption). Their figure details (car colours, dog, gate curve, model numbers, paper sums) now live in the On the board column.
- 21: the capacitance line was wrong because it made capacitance a flip threshold; it now says "how much charge a piece holds". Annotations were converted to the current format and a caption added. The model numbers were re-checked by simulation: 8 pieces 27.2 ticks, 16 pieces 103.0, ratio 3.78 (32 pieces: 3.88).
- Episodes 19 and 20 were not part of this revision (19 was revised separately in commit b75af2a).


## 2. Per episode: what to do (figure = folder in `src/figures/`)

| # | Figure | New hook (spoken) | Voice | Figure (HTML) |
|---|---|---|---|---|
| 11 | `regen-convoy2` | Car one WOBBLES, but in car five, you don't. | Re-record (the 2026-10-31 take has the old text) | **Rebuild the opening.** The start frame is now the solid convoy in the upper lane. Visual hook: the dog at 0.3 s, car 1 swerves on "WOBBLES", car 5 pulses straight on "car five". The ghost copying convoy, with the red dashed outline on ghost car 5, moves to row 2 (2.7-6.4 s) and fades on "So how does". The fold back ends on the solid convoy. |
| 12 | `full-adder-columns` | You add two numbers, but each column adds THREE. | Re-record | Small retime: 58 and 67 pulse at 0.8 s, the three slots show on "THREE" at 2.4 s, and the paper addition starts at 4.3 s. The teaser now says "doorbells". |
| 13 | `decoder-intercom` | Three switches, eight doorbells, but you NEVER ring two. | Re-record | Visual hook: on "NEVER ring two" (1.9 s) the levers snap to B, ground, right and only that doorbell rings; back to the start frame at 2.4 s. Cue words changed: "two floors", "Each doorbell", "all three match". |
| 14 | `priority-phone` | Two sounds, one speaker, and your CALL never loses. | Re-record | Visual hook: on "CALL never loses" (1.6 s) the call tile turns rust for 0.8 s and takes the speaker, then the music returns. "The call is three, the ping is zero" replaces the old ranking line. |
| 15 | `tristate-tank` | Two taps FIGHT over your tank, but nobody wins. | Re-record | The start frame already shows the fight. The taps now close at 5.0 s, on "neither tap win". |
| 16 | `switching-threshold-taps` | Handle at half, but your tank won't fill HALF. | Re-record | The start frame already matches. The empty-level pulse moves to "fill HALF" (2.0 s). The voice now says "Now it flips at half". |
| 17 | `bucket-stairs` | Half the floors, you climb a QUARTER, not half. | **Re-record** (the take `ElevenLabs_2026-11-01T15_43_45` has the old text; the page times are that take's, shifted by hand) | Visual hook: on "a QUARTER" the readout card flashes 16 and 4 side by side for 1 s. Re-sync `voice.ts` to the new take. |
| 18 | `short-circuit-taps` | A slow turn costs you TEN times the water. | Re-record | Visual hook: on "TEN times" the cup counter rolls from 00 to 10. Row 2 is shorter ("Where does that water go? Let's watch."): the handle pulses at 4.2 s, then returns, the tank refills and the meter zeroes from 5.4 s. Three circuit lines are split. |
| 21 | none yet | Twice your ice tray, but NOT twice the wait. | Record (first take) | No figure yet; build it from the page (slug suggestion `wire-rc-icetray`). Visual hook: a ghost short tray slides twice beside the long one on "Twice your", then a fast race stops the timers on 27 and 103. |


## 3. Order of work on the laptop

1. Record each voice block in ElevenLabs: Eleven v3, same voice, stability Creative or Natural, 2-3 takes, speed about 1.05.
2. Run `/htmlmp4 chip N <mp3>` per episode, in a new chat each time. For 11-18 it now follows the **re-take path** (its SKILL.md, steps 3-6):
   1. Transcribe the new take. The old transcript is already kept as `NN.old.words.json`.
   2. Run `npm run notes:retake -- builds/notes/episodes/chip-design/NN.old.words.json builds/notes/episodes/chip-design/NN.words.json --write <figure>`. It writes the voice page that moves every existing figure event onto the new take.
   3. Add only the page's new events (row 1 `Visual hook:` and the changed cue words) in the figure's own timeline.
   4. Write the cue file fresh from the Annotation column, then run the sign-off and the export.
3. Episode 21 has no figure yet: `/htmlmp4` builds it from the page (two-panel sample first, then the spec, as the skill says).
4. When a reel is exported, `/htmlmp4` updates its row in `series/reel-builds.csv`. Rows cd11-cd18 are marked `script revised: re-record, rebuild` until then.

## 4. Reel kit: what changed and why

- **Annotation planner fix (`builds/notes/annotations.mjs`, new `builds/notes/spell.mjs`).** Whisper writes spoken numbers as digits ("58", "64", "103", "21"), and the planner only mapped digits up to twenty. Every mark cued on a bigger number ("fifty-eight", "sixty-four times slower", "twenty-one", "a hundred and three", "twenty-seven ticks") would have come back "not found" and needed re-anchoring by hand; this affected 12, 17, 20 and 21. Both sides are now compared as one stream of canonical tokens, with number words folded to digits. That also matches "P" + "moss", "tri" + "-state" and "VDD" against "V D D". Tested:
  - the six real episodes in the zip (13-18 with their real transcripts) resolve exactly as before;
  - all eleven pages 11-21 resolve every mark with Whisper-style transcripts (before: up to 5 misses per page).
- **Re-take tool (`builds/notes/retake.mjs`, `npm run notes:retake`).** Episodes 11-18 already have figures, cue files and reels built on the old takes, and 13-18 are timed directly in the old take's seconds. The tool aligns the old and new transcripts word by word (about 95% of the words are unchanged) and writes the voice page `src/figures/<slug>/voice.ts`: the new LOOP and a map from the new take's time to the old take's time. An existing `voice.ts` is kept as `voice-take1.ts` and composed. It also writes `src/main-<slug>-voice.tsx` and `builds/build-<slug>-voice.mjs` when missing. It lists the spans spoken in only one take, which is where the new visual hooks and changed lines go. Tested end to end on 17 (no voice.ts) and 11 (existing voice.ts): both build and load with no errors.
- **Time-map hook in six figures (`live.tsx` of `decoder-intercom`, `priority-phone`, `tristate-tank`, `switching-threshold-taps`, `bucket-stairs`, `short-circuit-taps`).** This is the same `setTimeMap` hook 11 and 12 already have, so a voice page can drive them. With no voice page the output is unchanged. All eight figures of 11-18 build and load in headless Chrome with no errors.
- **Old transcripts kept** as `builds/notes/episodes/chip-design/NN.old.words.json` (11-18; 13's came from `builds/notes/episodes/13.words.json`), because transcribing the new take overwrites `NN.words.json`.
- **`/htmlmp4` skill:** new re-take path (steps 3-6), the planner's spelling note, and the rule to write the cue file fresh from the plan, never by patching the old take's cue. **`builds/notes/README.md`:** the new tools are listed.
- **`series/reel-builds.csv`:** rows cd11-cd18 are marked `script revised: re-record, rebuild`, with a note that their exported files are the old take.
- **Saved page copies** `builds/notes/episodes/chip-design/13-18.page.md` replaced with the revised pages (`/htmlmp4` fetches them from Notion again anyway).
- **Script part:**
  - the `/script` skill with the Instagram scoring tools (`script-writer/ig/`);
  - `scripts/` with the revised pages 11-18 and 21 and the current 19 and 20;
  - `series/book-concepts.csv` with Hook title and Analogy synced to Notion.
- **`.gitignore`:** keeps `node_modules`, `.tools`, built `shorts/`, audio and video, and the Samble font files out of this public repo. Samble ships with no licence text, only a donation note, so its files are not published here.
- **Not changed:**
  - no figure's look or timeline (the visual hooks are added by `/htmlmp4` with your review of the sample sheet, as the skill says);
  - CLAUDE.md, SCRIPTS.md, `rules/`;
  - the checkers in `script-writer/`;
  - the notes builder, check and export.

## 5. Known open items (left as they were)

- 11 still says volt values aloud ("one near one volt", "half a volt", "seven tenths"), against the plain-numbers rule. Changing it means reworking the circuit half.
- Some episodes are over the chip-design annotation cap: 13, 15, 17 and 18 have more than 5 pen marks, and 17 (28 notes) and 18 (21 notes) have more than 20 notes.
- A few WARNs remain from before: "beat shares no word with the one before" (mostly the first line after the fold), and some gaps of 6+ s without a new mark in 13, 14 and 16.
- The caption tool flags hashtags inside the visible window and no call to action on every caption. Both follow from the one-line caption format and are fine per the `/script` skill.


## 6. Files that differ from the uploaded `reel-kit.zip`

Changed (26):

- `.claude/skills/htmlmp4/SKILL.md`
- `builds/notes/README.md`
- `builds/notes/annotations.mjs`
- `builds/notes/episodes/chip-design/13.page.md`
- `builds/notes/episodes/chip-design/14.page.md`
- `builds/notes/episodes/chip-design/15.page.md`
- `builds/notes/episodes/chip-design/16.page.md`
- `builds/notes/episodes/chip-design/17.page.md`
- `builds/notes/episodes/chip-design/18.page.md`
- `package.json`
- `series/reel-builds.csv`
- `src/figures/bucket-stairs/live.tsx`
- `src/figures/decoder-intercom/live.tsx`
- `src/figures/priority-phone/live.tsx`
- `src/figures/short-circuit-taps/live.tsx`
- `src/figures/switching-threshold-taps/live.tsx`
- `src/figures/tristate-tank/live.tsx`
- `.claude/skills/script/SKILL.md`
- `README.md`
- `scripts/13 What does a decoder do in a memory chip.md`
- `scripts/15 What is a tri-state buffer and why does a bus need it.md`
- `scripts/16 What sets the switching threshold of a CMOS inverter.md`
- `scripts/17 Why does lowering supply voltage save so much power.md`
- `scripts/18 What is short-circuit power in CMOS.md`
- `scripts/19 What is subthreshold leakage.md`
- `series/book-concepts.csv`

New (21):

- `.gitignore`
- `builds/notes/episodes/chip-design/11.old.words.json`
- `builds/notes/episodes/chip-design/12.old.words.json`
- `builds/notes/episodes/chip-design/13.old.words.json`
- `builds/notes/episodes/chip-design/14.old.words.json`
- `builds/notes/episodes/chip-design/15.old.words.json`
- `builds/notes/episodes/chip-design/16.old.words.json`
- `builds/notes/episodes/chip-design/17.old.words.json`
- `builds/notes/episodes/chip-design/18.old.words.json`
- `builds/notes/retake.mjs`
- `builds/notes/spell.mjs`
- `script-writer/ig/LICENSE`
- `script-writer/ig/beats.py`
- `script-writer/ig/caption.py`
- `script-writer/ig/hooks.json`
- `script-writer/ig/hookscore.py`
- `scripts/11 What is the regenerative property of logic gates.md`
- `scripts/12 How does a full adder work.md`
- `scripts/14 What is a priority encoder.md`
- `scripts/20 How do you drive a large capacitive load quickly.md`
- `scripts/21 Why does wire delay grow with the square of length.md`

---

## Reel kit: set up and use

### Set up

1. **Folder location:** unzip so the project folder is exactly `D:\Anatomy` (rename `reel-kit` to `Anatomy` and put it on drive D). About 40 figure files and the font rules load fonts from `file:///D:/Anatomy/...`. If there is no D drive, ask Claude to replace `D:/Anatomy` with the new folder path in `src/` and `builds/` first.
2. Open the folder in Claude Code. Keep the hidden `.claude` folder.
3. Install **Node 22+**, **Google Chrome** and **ffmpeg** (on PATH), then run `npm install` in the folder.
4. Install **Python 3** for the checkers.
5. **Transcribe (voice timing):** create the whisper env the scripts expect:
   ```
   python -m venv .tools\whisper
   .tools\whisper\Scripts\pip install faster-whisper numpy
   ```
6. Connect Notion (claude.ai Settings > Connectors > Notion) and share the **Shorts** page with the `book-concepts.csv`, `digital-electronics.csv` and `verilog.csv` databases (same names).

### Use

- Script: `/script video 20 chip design`
- Figure and reel after recording the voice: `/htmlmp4 chip 20 <path to mp3>` (run it in a new chat)
- New figure by hand: `/new-figure <spec>`

Outputs go to `shorts/<series>/<NN> <interview question>/`. The grid backdrop page is in `shorts/backdrops/`; render it once with `node builds/capture.mjs "shorts/backdrops" --scale 1 --fps 30`.

### Not included

Earlier episodes' built pages, voice mp3s and videos (`shorts/`, about 67 GB). Sources for every figure are in `src/figures/`, so `/htmlmp4` can copy any older figure as a starting point.

### What is inside (script part)

| Path | What it is |
|---|---|
| `.claude/skills/script/SKILL.md` | The `/script` skill |
| `CLAUDE.md` | Project rules (sections 2-7 matter for scripts: colours, parts limits, timing, logic and physics) |
| `SCRIPTS.md` | Full script rules |
| `rules/chip-design.md`, `rules/analogy.md` | Chip-design story shape, analogy objects |
| `script-writer/` | Brief, annotation rules, understanding test, checkers (`check-voice.py`, `check-page.py`, `check-annotations.py`, `storyboard.py`), example pages |
| `script-writer/ig/` | Scoring tools from the MIT [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill), patched for the voice block: `hookscore.py` (hook score), `beats.py` (beat timing and loop), `caption.py` (caption lint), `hooks.json` (26 hook formulas) |
| `series/*.csv` | Episode lists (backup; Notion wins) |
| `scripts/` | Finished pages, as examples and backup |
