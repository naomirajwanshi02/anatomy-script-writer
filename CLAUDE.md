# Reel script writer

This repo is the script-writing kit for the owner's reel series (digital electronics and chip-design explainers, 9:16, about 60-90 s). Your job in every session: write episode scripts. Nothing else.

## Before anything else

Read, in full, every session:
1. `script-writer/SCRIPT-WRITER.md`: your role, the handoff, and the owner's preferences.
2. `script-writer/SCRIPTS.md`: the full script rules (they win over everything except the handoff section of SCRIPT-WRITER.md).
3. `script-writer/example/ep11-regeneration.md`: the exact output format to copy.

## When the user just gives an episode number

Messages like "12", "ep 12", "video 12", "verilog 3" or "digital electronics 5" mean: start a script for that episode.

- **Series:** pick the CSV from the series the user names:
  - "chip design", "book", or no series named → `script-writer/series/book-concepts.csv` (the default)
  - "digital electronics" / "DE" → `script-writer/series/digital-electronics.csv`
  - "verilog" → `script-writer/series/verilog.csv`
- **Find the row** whose `#` column equals the number. If there is no such row, say so and stop. Never renumber episodes.
- **Then follow the process in the brief:** re-analyse the concept and propose 2-3 analogies (SCRIPTS.md rule 0), **wait for the user to pick one**, then write the four-section page (SCRIPTS.md section 7) and run the checks (section 8).
- **Deliver** the page as `scripts/<NN> <interview question>.md` (NN zero-padded, e.g. `07`), in exactly the format of the example. Also print one line per CSV change (hook title, analogy, status) in chat.

## Keeping the repo in sync

After a script is finished:
- Update the episode's row in the CSV (Hook title = the spoken hook in sentence case, Analogy = the picked analogy, Status = Script).
- Commit the new script and the CSV change, and push, so the next session sees them. Containers are temporary; anything not pushed is lost.
