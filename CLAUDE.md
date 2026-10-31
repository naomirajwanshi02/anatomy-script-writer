# Reel script writer

This repo is the script-writing kit for the owner's reel series (digital electronics and chip-design explainers, 9:16, about 60-90 s). Your job in every session: write episode scripts. Nothing else.

## Before anything else

Read, in full, every session:
1. `script-writer/SCRIPT-WRITER.md`: your role, the handoff, and the owner's preferences.
2. `script-writer/SCRIPTS.md`: the full script rules (they win over everything except the handoff section of SCRIPT-WRITER.md).
3. `script-writer/example/ep13-decoder.md`: the exact output format to copy (voice block on top, then one 3-column table).

## Notion is the source of truth (owner's rule, 2026-10-31)

Every edit goes to Notion. The databases live under the Notion page **Shorts**:
- Chip design: database `book-concepts.csv`, data source `collection://34fc9dbf-37af-4377-b5f2-a48a2a84515c`.
- If that ID is not found (another Notion account), search for the database by name.
- Find the other series' databases with Notion search (`digital-electronics.csv`, `verilog.csv`).

- **Look up the episode in Notion first**, not the local CSV (the local CSVs can be stale). Fetch the episode's row page: an existing script in it is the current version. Revise it in place; never start over or overwrite it without asking.
- **Write the script into the episode's row page** (the voice block, then the 3-column table, as in the example). Set Status = Script, tick Script, and set Hook title to the spoken hook (sentence case, no CAPS).
- Edit pages with small targeted updates; do not replace a whole page unless asked.
- The local CSVs and `scripts/` are only a backup. After a Notion edit, mirror the change in the CSV and commit and push.

## When the user just gives an episode number

Messages like "12", "ep 12", "video 12", "verilog 3" or "digital electronics 5" mean: start a script for that episode.

- **Series:** pick the CSV from the series the user names:
  - "chip design", "book", or no series named → `script-writer/series/book-concepts.csv` (the default)
  - "digital electronics" / "DE" → `script-writer/series/digital-electronics.csv`
  - "verilog" → `script-writer/series/verilog.csv`
- **Find the row** whose `#` column equals the number (in Notion first, see above). If there is no such row, say so and stop. Never renumber episodes.
- **Before showing any voice block, or calling an existing one ready,** save it to a file and run `python3 script-writer/check-voice.py <file> --series <chip|de|verilog> --episode N`. Show the result. Never call a script ready while it FAILs, and answer every WARN.
- **Then follow the process in the brief:** re-analyse the concept and propose 2-3 analogies (SCRIPTS.md rule 0), **wait for the user to pick one**, then write the page (SCRIPTS.md section 7) and run the checks (section 8).
- **Deliver** the page into the Notion row; keep a copy as `scripts/<NN> <interview question>.md` (NN zero-padded, e.g. `07`), in exactly the format of the example. Also print one line per CSV change (hook title, analogy, status) in chat.

## Keeping the repo in sync

After a script is finished:
- Update the episode's row in the CSV (Hook title = the spoken hook in sentence case, Analogy = the picked analogy, Status = Script).
- Commit the new script and the CSV change, and push, so the next session sees them. Containers are temporary; anything not pushed is lost.
