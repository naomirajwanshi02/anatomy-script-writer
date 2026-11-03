---
name: script
description: Write or revise one reel episode script and save it straight into the owner's Notion database. Use when the user types /script with an episode number and series, e.g. "/script video 14 chip design", "/script 5 digital electronics", "/script verilog 3".
argument-hint: "video <N> <chip design | digital electronics | verilog>"
---

# /script: one episode, straight into Notion

Arguments: `$ARGUMENTS` (an episode number and a series; no series = chip design). The rules live in the files below; this skill is only the order of work and the scores to reach. Aim for the top score on every tool, not a bare pass.

## 1. Load the rules (every time, in full)

`script-writer/SCRIPT-WRITER.md`, `SCRIPTS.md`, `script-writer/ANNOTATIONS.md`, `script-writer/example/ep13-decoder.md` (the layout to copy). Chip-design: also `rules/chip-design.md` and CLAUDE.md sections 5-7. They win over this file and over memory.

## 2. Find the episode in Notion (the source of truth)

| Series words | Notion database (under "Shorts") | Backup CSV |
|---|---|---|
| chip design, chip, book, or none | `book-concepts.csv`, `collection://34fc9dbf-37af-4377-b5f2-a48a2a84515c` | `series/book-concepts.csv` |
| digital electronics, DE | `digital-electronics.csv` (Notion search) | `series/digital-electronics.csv` |
| verilog | `verilog.csv` (Notion search) | `series/verilog.csv` |

Another workspace: search the database by name. Query the row whose `#` is N and fetch its page. No row: say so and stop (never create or renumber). No Notion tools: tell the owner to connect Notion and stop.

## 3. Decide the job

- **Page has a script:** report hook, analogy and Status in 3 lines, run step 5 on it, ask what to change, edit only what is approved.
- **Page is empty:** SCRIPTS.md rule 0 (idea in one sentence, what makes it work, 2-3 analogies, a recommendation), then **wait for the pick**.

## 4. Write

The page is SCRIPTS.md section 7, laid out exactly like the example; annotations in the ANNOTATIONS.md section 5 format; chip-design ends with `## Caption`. Work in scratch: the detailed script, the 15-year-old questions, and every number, sum and bit pattern computed in a script. Hooks: draft 3 in the SCRIPTS.md section 4 forms (`script-writer/ig/hooks.json` has 26 more formulas for ideas) and keep the best that scores highest in step 5.

## 5. Score and fix (repeat until every line holds)

Run from the repo root on the scratch files.

| Tool | Target |
|---|---|
| `python3 script-writer/check-voice.py <block> --series <chip\|de\|verilog> --episode N` | PASS; TONE 80+ (SCRIPTS.md 3a, the house style); every WARN fixed or answered in one line |
| `python3 script-writer/ig/hookscore.py hooks.txt` (one hook per line, no tags) | the shipped hook scores 80+ STRONG; a number in the hook is usually what gets it there |
| `python3 script-writer/ig/beats.py <block or page>` | no flags: every sentence 4 s or less (about 12 words), the bridge before the sign-off echoes a hook word ("Loops"), length on target |
| `python3 script-writer/check-page.py page.md` | PASS, no WARN (every board event tied to its spoken words) |
| `python3 script-writer/check-annotations.py page.md --series <s>` | PASS; WARNs fixed or answered |
| `python3 script-writer/ig/caption.py caption.txt` (chip-design caption) | PASS on length, first line and concrete hook (put a number in it); the hashtag-in-window and no-ask WARNs follow from the owner's one-line caption and are fine |

Then, inline (no subagents), and fix everything they find:
1. **Cold listener:** for every line, what a 15-year-old who has seen nothing would ask, or "clear" (SCRIPTS.md sections 3-4: cold openings, bare questions, use before introduction, unclear pronouns, a hook that is an order).
2. **Notes:** for every NOTE, readable in one glance, every word known, adds to the voice, clear what it points at.
3. **Sharp student:** for every circuit claim, would a BTech student or an interviewer object? Answer the obvious follow-up (ep 20: "why not one big inverter?", "why about 4x?") on screen or in the voice. A demo that accidentally supports the wrong answer is a bug (ep 20's first draft: one 16-wide inverter took 16 + 4 = 20, still far better than 64).
4. **Storyboard self-check:** `python3 script-writer/storyboard.py page.md`, then `script-writer/UNDERSTANDING-TEST.md` section 0, letters A-H.
5. **Read it aloud as the friend explaining** (SCRIPTS.md 3a): does it sound like talking, not reading? Do the casual lines still say exactly what the plain ones would? No dub-breaking idioms.
6. **Rate it** 1-10 on hook, analogy, circuit argument, line clarity, flow and tone. Anything under 8 is rewritten before it goes to Notion.

The `ig/` tools come from an Instagram creator kit. They are patched for spelt-out numbers and ElevenLabs tags. Ignore their advice where the owner's rules differ: no AI-detection score, no burned-in subtitles, 60-70 s chip-design length (not 15-45 s), no spoken call to action, numbers spelt out. Their safe zone (text inside y 230-1440, right 230 px clear) is stricter than ANNOTATIONS.md: place notes inside it where the free paper allows, and list any note planned below y 1440 in the report.

## 6. Save to Notion

- Empty page: insert the page. Existing page: small `update_content` edits; after a voice edit, change the block and column 1 together, retime the rows and re-run step 5. Replace the whole page only when most rows change, and say so. Old four-section layout: offer to convert first.
- Properties: Status = Script, Script = Yes, Hook title = the spoken hook in sentence case (no CAPS), Analogy = the picked analogy and its mapping.
- Fetch the page once and re-run `check-voice.py`, `check-page.py` and `check-annotations.py` on the saved text (Notion rewrites characters; `/htmlmp4` reads the saved page).

## 7. Back up and report

- Mirror Hook title, Analogy and Status in the backup CSV; save the page as `scripts/<NN> <interview question>.md`. On the laptop, no git (CLAUDE.md). In a cloud session, commit and push: the container is deleted.
- In chat: the Notion link, one table of scores (each tool's result, hook score, TONE score, rating), what the passes changed, and one line per CSV change. Next step for the owner: record the voice, then `/htmlmp4 <series> <N> <mp3>` in a new chat.
