---
name: script
description: Write or revise one reel episode script and save it straight into the owner's Notion database. Use when the user types /script with an episode number and series, e.g. "/script video 14 chip design", "/script 5 digital electronics", "/script verilog 3".
argument-hint: "video <N> <chip design | digital electronics | verilog>"
---

# /script: one episode, straight into Notion

Arguments: `$ARGUMENTS` (an episode number and a series; no series = chip design).

## 1. Load the rules (every time, in full)

Read `script-writer/SCRIPT-WRITER.md`, `script-writer/SCRIPTS.md` and `script-writer/example/ep11-regeneration.md`. They win over anything you remember.

## 2. Find the episode in Notion (the source of truth)

| Series words | Notion database (under the page "Shorts") | Backup CSV |
|---|---|---|
| chip design, chip, book, or none | `book-concepts.csv`, data source `collection://34fc9dbf-37af-4377-b5f2-a48a2a84515c` | `script-writer/series/book-concepts.csv` |
| digital electronics, DE | `digital-electronics.csv` (find with Notion search) | `script-writer/series/digital-electronics.csv` |
| verilog | `verilog.csv` (find with Notion search) | `script-writer/series/verilog.csv` |

- Use the Notion tools: search or query the data source for the row whose `#` equals N, then fetch that row's page.
- No such row: say so and stop. Never create or renumber episodes.
- Notion tools not available in this session: tell the user to connect Notion (claude.ai Settings → Connectors) and stop; do not fall back to local files silently.

## 3. Decide what the job is

- **Page already has a script:** report its state in 3 lines (hook, analogy, Status), run the checks in step 5 on it, and ask what to change. Edit only what the user approves.
- **Page is empty:** do SCRIPTS.md rule 0. Restate the idea in one sentence, name what makes it work, give 2-3 analogies with one line each on why it fits or breaks, recommend one, and **wait for the pick**. This stop is the owner's own rule; never skip it.

## 4. Write

After the pick, write the full page (SCRIPTS.md section 7, exactly the format of the example: four sections). Compute every number, bit pattern and sum in a scratch script first.

## 5. Check before anything goes to Notion

1. Save the voice block to a scratch file and run
   `python3 script-writer/check-voice.py <file> --series <chip|de|verilog> --episode N`.
   It must PASS. Fix every ERROR; for every WARN rewrite the beat or write one line on why it is fine.
2. **Fresh-eyes review:** start one subagent (Agent tool, general-purpose) that has not seen the writing. Give it only: the voice block, SCRIPTS.md sections 3 and 4, and this task: "Read the block aloud as a 15-year-old who has seen nothing. For every line, say what the listener would ask ('what?', 'how what?', 'why?') or 'clear'. Flag any line that opens cold, any bare question, anything used before it is introduced, any pronoun with an unclear owner. Report line by line; do not rewrite." Fix what it finds and re-run the checker.
3. Run SCRIPTS.md section 8 checks 1-6 and keep the results for the summary.

## 6. Save to Notion

- Write the page body into the episode's row page. For an empty page, insert the four sections. For an existing page, use small `update_content` replacements only, and after any voice edit update every quote of that line in sections 1, 3 and 4.
- Set properties: Status = Script, Script = Yes, Hook title = the spoken hook in sentence case (no CAPS), Analogy = the picked analogy.
- Fetch the page once after writing and re-run the checker on the saved block.

## 7. Back up and report

- Mirror the row change (Hook title, Analogy, Status) in the backup CSV, save the page copy as `scripts/<NN> <interview question>.md`, then commit and push.
- In chat: the Notion link, the checker result, the reviewer's findings and what you changed, and one line per CSV change. Keep it short.
