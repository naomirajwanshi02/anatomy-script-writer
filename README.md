# Handover: chip-design episodes 11-18 and 21 (2026-11-02)

For the desktop Claude session on the laptop (`D:/Anatomy`). Read this page first. The source of truth for every episode is its Notion page in `book-concepts.csv` (Shorts). The same pages are backed up here in `scripts/`. Each page holds three things:
- the ElevenLabs voice block to record;
- the **On the board** column: the brief for the HTML figure;
- the **Annotation** column: what `/htmlmp4` draws.

Notion handover page with the same content: <https://app.notion.com/p/40ce67c0c52481c4b841eabdb12283ae>

## 1. What changed and why

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

## 2. Per episode: what to do

| # | New hook (spoken) | Voice | Figure (HTML) |
|---|---|---|---|
| 11 | Car one WOBBLES, but in car five, you don't. | Re-record (the 2026-10-31 take has the old text) | **Rebuild the opening.** The start frame is now the solid convoy in the upper lane. Visual hook: the dog at 0.3 s, car 1 swerves on "WOBBLES", car 5 pulses straight on "car five". The ghost copying convoy, with the red dashed outline on ghost car 5, moves to row 2 (2.7-6.4 s) and fades on "So how does". The fold back ends on the solid convoy. |
| 12 | You add two numbers, but each column adds THREE. | Re-record | Small retime: 58 and 67 pulse at 0.8 s, the three slots show on "THREE" at 2.4 s, and the paper addition starts at 4.3 s. The teaser now says "doorbells". |
| 13 | Three switches, eight doorbells, but you NEVER ring two. | Re-record | Visual hook: on "NEVER ring two" (1.9 s) the levers snap to B, ground, right and only that doorbell rings; back to the start frame at 2.4 s. Cue words changed: "two floors", "Each doorbell", "all three match". |
| 14 | Two sounds, one speaker, and your CALL never loses. | Re-record | Visual hook: on "CALL never loses" (1.6 s) the call tile turns rust for 0.8 s and takes the speaker, then the music returns. "The call is three, the ping is zero" replaces the old ranking line. |
| 15 | Two taps FIGHT over your tank, but nobody wins. | Re-record | The start frame already shows the fight. The taps now close at 5.0 s, on "neither tap win". |
| 16 | Handle at half, but your tank won't fill HALF. | Re-record | The start frame already matches. The empty-level pulse moves to "fill HALF" (2.0 s). The voice now says "Now it flips at half". |
| 17 | Half the floors, you climb a QUARTER, not half. | **Re-record** (the take `ElevenLabs_2026-11-01T15_43_45` has the old text; the page times are that take's, shifted by hand) | Visual hook: on "a QUARTER" the readout card flashes 16 and 4 side by side for 1 s. Re-sync `voice.ts` to the new take. |
| 18 | A slow turn costs you TEN times the water. | Re-record | Visual hook: on "TEN times" the cup counter rolls from 00 to 10. Row 2 is shorter ("Where does that water go? Let's watch."): the handle pulses at 4.2 s, then returns, the tank refills and the meter zeroes from 5.4 s. Three circuit lines are split. |
| 21 | Twice your ice tray, but NOT twice the wait. | Record (first take) | No figure yet; build it from the page (slug suggestion `wire-rc-icetray`). Visual hook: a ghost short tray slides twice beside the long one on "Twice your", then a fast race stops the timers on 27 and 103. |

## 3. Order of work on the laptop

1. Record each voice block in ElevenLabs: Eleven v3, same voice, stability Creative or Natural, 2-3 takes, speed about 1.05.
2. Update the figures for 11, 12, 13, 14, 17 and 18 (row 1 of each page, plus the retimes in section 2), and build 21 from its page.
3. Run `/htmlmp4 chip-design N <mp3>` per episode. It re-times the figure and every annotation from the recording, then runs the sign-off: `check-annotations.py`, `annotations.mjs signoff` and `notes:check`.

## 4. Known open items (left as they were)

- 11 still says volt values aloud ("one near one volt", "half a volt", "seven tenths"), against the plain-numbers rule. Changing it means reworking the circuit half.
- Some episodes are over the chip-design annotation cap: 13, 15, 17 and 18 have more than 5 pen marks, and 17 (28 notes) and 18 (21 notes) have more than 20 notes.
- A few WARNs remain from before: "beat shares no word with the one before" (mostly the first line after the fold), and some gaps of 6+ s without a new mark in 13, 14 and 16.
- The caption tool flags hashtags inside the visible window and no call to action on every caption. Both follow from the one-line caption format and are fine per the `/script` skill.

## 5. Files in this handover

| Path | What |
|---|---|
| `scripts/11 … .md` to `scripts/18 … .md`, `scripts/21 … .md` | The nine revised pages, as saved in Notion |
| `scripts/19 … .md`, `scripts/20 … .md` | Current pages for 19 and 20 (not part of this revision) |
| `series/book-concepts.csv` | Hook title and Analogy synced with Notion for 11-18 and 21 |

---

## Script kit (unchanged): how this repo works

This folder is the script part of the reel project. Only `/script` works here; the figure, render and reel tools (`src/`, `builds/`, `/htmlmp4`) are not included.

### Set up

1. Unzip into an empty folder and open that folder in Claude Code (desktop app Code tab, CLI or claude.ai/code with the folder in a repo). Keep the hidden `.claude` folder.
2. Install Python 3 (the checkers need nothing else).
3. Connect Notion (claude.ai Settings > Connectors > Notion) and share the **Shorts** page with the `book-concepts.csv`, `digital-electronics.csv` and `verilog.csv` databases. On another workspace the skill finds the databases by name, so keep the names.
   - Without Notion the skill stops. Then ask Claude to follow `script-writer/SCRIPT-WRITER.md` section 2 instead: it writes the page as `scripts/<NN> <interview question>.md` for you to paste into Notion.

### Use

Type `/script video 20 chip design` (or `/script 5 digital electronics`, `/script verilog 3`). Claude proposes 2-3 analogies and waits for your pick, then writes the page, runs the checkers and saves it.

### What is inside

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
