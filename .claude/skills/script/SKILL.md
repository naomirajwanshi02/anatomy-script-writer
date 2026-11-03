---
name: script
description: Write or revise one reel episode script and save it straight into the owner's Notion database. Use when the user types /script with an episode number and series, e.g. "/script video 14 chip design", "/script 5 digital electronics", "/script verilog 3".
argument-hint: "video <N> <chip design | digital electronics | verilog>"
---

# /script: one episode, straight into Notion

Arguments: `$ARGUMENTS` (an episode number and a series; no series = chip design).

## 1. Load the rules (every time, in full)

Read `script-writer/SCRIPT-WRITER.md`, `SCRIPTS.md`, `script-writer/ANNOTATIONS.md` (annotation design rules and the Annotation column format) and `script-writer/example/ep13-decoder.md` (the layout to copy). Chip-design: also `rules/chip-design.md` (analogy choice, hook on the object, story shape, part limits are in CLAUDE.md section 5). They win over anything you remember.

## 2. Find the episode in Notion (the source of truth)

| Series words | Notion database (under the page "Shorts") | Backup CSV |
|---|---|---|
| chip design, chip, book, or none | `book-concepts.csv`, data source `collection://34fc9dbf-37af-4377-b5f2-a48a2a84515c` | `series/book-concepts.csv` |
| digital electronics, DE | `digital-electronics.csv` (find with Notion search) | `series/digital-electronics.csv` |
| verilog | `verilog.csv` (find with Notion search) | `series/verilog.csv` |

- The data source ID above is for the original workspace. If it is not found (another Notion account), search Notion for the database by name instead.
- Use the Notion tools: search or query the data source for the row whose `#` equals N, then fetch that row's page.
- No such row: say so and stop. Never create or renumber episodes.
- Notion tools not available in this session: tell the user to connect Notion (claude.ai Settings → Connectors) and stop; do not fall back to local files silently.

## 3. Decide what the job is

- **Page already has a script:** report its state in 3 lines (hook, analogy, Status), run the checks in step 5 on it, and ask what to change. Edit only what the user approves.
- **Page is empty:** do SCRIPTS.md rule 0. Restate the idea in one sentence, name what makes it work, give 2-3 analogies with one line each on why it fits or breaks, recommend one, and **wait for the pick**. This stop is the owner's own rule; never skip it.

## 4. Write

After the pick, write the page (SCRIPTS.md section 7), exactly like the example:

1. The ElevenLabs block at the very top (```txt), then one line of ElevenLabs notes and one line on times and the note check.
2. One table with three columns, `ElevenLabs script | On the board | Annotation`, one row per voice line or short group of lines: column 1 = bold time range + the exact block words (tags included); column 2 = what the figure shows, each event timed to the word it lands on (first row sets up the board, key row says what the model computes); column 3 = the annotations, one mark per line in the ANNOTATIONS.md section 5 format (`NOTE "…" · on "…" (s) · out … · place · tie …` and `PEN shape · on "…" (s) · target · out …`), joined with `<br>`; `Nothing new.` when a row adds nothing. `/htmlmp4` builds the reel from exactly these lines, so every mark must be final.
3. **Plan the annotations as a hand-drawn layer** (ANNOTATIONS.md sections 1-4): each mark points, groups, counts, names the state or labels a part; every note is tied to its part by an arrow, underline or box; at most 6 words (4 for DE and Verilog); copy chip-design 01-07 (definitions, the rule, each worked step as its own line, mapping lines; worked lines may float without a tie); 1-3 word labels may echo the voice's key word, longer notes never repeat it; a proper-term label on each circuit part as it appears ("VDD", "PMOS on", "charge = C x V"), tied to its analogy partner where it helps; one `key` mark on the key state; the hook note, the `Episode N` badge (top right, on the series line) and the end card (`at end-4`, boxed takeaway; no interview answer block in chip-design). DE 01-02 density: about one new mark every 2-3 s, doodles welcome.
4. **Chip-design only:** end the page with `## Caption`: one short post caption line, then exactly 5 hashtags from the SCRIPTS.md section 7 list (the 5 that fit the episode best).

Nothing else goes on the page. Do the detailed script and the 15-year-old questions in scratch, for the checks. Compute every number, bit pattern and sum in a scratch script first.

## 5. Check before anything goes to Notion

1. Save the voice block to a scratch file and run
   `python script-writer/check-voice.py <file> --series <chip|de|verilog> --episode N`.
   It must PASS. Fix every ERROR; for every WARN rewrite the beat or write one line on why it is fine.
2. **Cold-listener pass (inline, no subagent; token budget 2026-11-02):** re-read SCRIPTS.md sections 3 and 4, then write in scratch, for every line of the block, what a 15-year-old who has seen nothing would ask ('what?', 'how what?', 'why?') or 'clear'. Flag every line that opens cold, every bare question, anything used before it is introduced, every pronoun with an unclear owner, every hook that is an order or does not show its cause. Be as strict as a stranger: a line is 'clear' only if it needs nothing that is not said before it. Fix every flag and re-run the checker.
3. Save the whole page as `page.md` and run `python script-writer/check-page.py page.md`. It must PASS (column 1 = block word for word, cue words spoken in their row, row times in order).
4. Run `python script-writer/check-annotations.py page.md --series <chip|de|verilog>`. It must PASS (format, word limits, ties, no voice repeat, cue words spoken in their row, Samble glyphs, density, folds, end card, one key mark). Answer every WARN with a fix or one line on why it is fine.
   **Note pass (inline, no subagent):** re-read ANNOTATIONS.md sections 1-4, then answer in scratch for every NOTE line, as a 15-year-old who sees it for 3 s while listening: can it be read in one glance, is every word known (no term before the voice or an earlier note introduces it; one name per thing), does it add something the voice did not say, is it clear what it points at? Answer 'clear' or the problem; fix every problem and re-run the checker.
5. Run SCRIPTS.md section 8 checks 1-6 and keep the results for the summary.
6. **Storyboard self-check (script stage), last and required:** follow `script-writer/UNDERSTANDING-TEST.md` section 0. Make the storyboard with `python script-writer/storyboard.py page.md` and, without subagents, answer both viewers' questions (sections 1 and 2) from the storyboard alone, then grade yourself with letters A-H (section 3). Every cause must have its own visible action on screen at the moment the voice names it; every circuit part its proper label when it is named; every number the voice says must match what the figure shows at that second. Fix every letter you would call borderline (analogy: a visible action per cause or a new analogy; circuit: bigger parts, one part per line, proper labels, never parts removed), re-run checks 1-5. The blind test with real viewers runs once, on the annotated reel (`/htmlmp4` step 6b). Rule checks passing is never enough on its own.

## 6. Save to Notion

- Write the page body into the episode's row page. For an empty page, insert the page. For an existing page in this layout, use small `update_content` replacements; after any voice edit, update the line in the block and in column 1, retime the rows, and re-run both checkers. An existing page in the old four-section layout: tell the user and offer to convert it (replace_content) before editing.
- Set properties: Status = Script, Script = Yes, Hook title = the spoken hook in sentence case (no CAPS), Analogy = the picked analogy.
- Fetch the page once after writing and re-run `check-voice.py`, `check-page.py` and `check-annotations.py` on the saved page (Notion may rewrite characters; the saved page is what `/htmlmp4` reads).

## 7. Back up and report

- Mirror the row change (Hook title, Analogy, Status) in the backup CSV, save the page copy as `scripts/<NN> <interview question>.md`. No git (CLAUDE.md).
- In chat: the Notion link, the three checker results, the storyboard self-check result (letters A-H), what the cold-listener and note passes changed, and one line per CSV change. Keep it short. Next step for the owner: record the voice, then run `/htmlmp4 <series> <N> <mp3>` **in a new chat** (a fresh chat re-reads far less than this one; the Notion page carries everything `/htmlmp4` needs).
