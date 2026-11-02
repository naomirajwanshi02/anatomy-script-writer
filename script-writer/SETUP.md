# Setting up the reel script writer on another account

Everything lives in this one repo. Rebuild it anywhere in about 10 minutes.

## What is in the repo

| Path | What it is |
|---|---|
| `CLAUDE.md` | Read automatically by every Claude Code session in this repo. Says: read the rules first, Notion is the source of truth, how to handle "video 14", run the checkers before calling anything ready. |
| `.claude/skills/script/SKILL.md` | The `/script` skill. `/script video 14 chip design` finds the episode in Notion, proposes analogies (waits for your pick), writes the page, checks it, saves it to Notion, backs up to the repo. |
| `script-writer/SCRIPT-WRITER.md` | The brief: role, handoff, your standing preferences (voice tone, series line, chip-design structure). |
| `SCRIPTS.md` | The full script rules. Section 7 = page layout (voice block on top, then one table: ElevenLabs script / On the board / Annotation). Section 8 = checks. |
| `script-writer/check-voice.py` | Checker for the ElevenLabs block: word count, sentence length, tags, CAPS, series line, teaser, bare "How?" questions, flow warnings. |
| `script-writer/check-page.py` | Checker for the whole page: column 1 = block word for word, cue words spoken in their row, note limits (3 on screen, 1.5 s apart, 2.5 s up), nothing during folds, Samble characters, end card 4 s before the end. |
| `script-writer/example/ep13-decoder.md` | The page layout to copy. |
| `script-writer/example/ep11-regeneration.md` | Older four-section layout; kept as a guide to depth and wording only. |
| `series/*.csv` | Backup copies of the three episode lists. Notion wins if they differ. |
| `scripts/` | Backup copy of each finished page. |

## The "agent"

There is no separate agent file. The `/script` skill starts a **fresh-eyes reviewer** itself (step 5.2): a general-purpose subagent that gets only the voice block and the voice/hook rules, reads it as a 15-year-old who has seen nothing, and reports line by line ("how what?", "opens cold", "used before introduced"). It exists because the writer reviewing its own lines missed the bare "How? Let's watch." in episode 13.

## Steps on the new account

1. **GitHub:** create an empty private repo (github.com/new, no README). Upload this repo's files to it, keeping the folder structure (including the hidden `.claude` folder), or push from a computer:
   ```bash
   git remote set-url origin https://github.com/<new-account>/<repo>.git
   git push -u origin main
   ```
2. **Connect GitHub to Claude:** claude.ai → Settings → Connectors (or claude.ai/code → connect GitHub) and install the Claude GitHub App on the new repo.
3. **Connect Notion:** claude.ai → Settings → Connectors → Notion, and give it access to the **Shorts** page (with the `book-concepts.csv`, `digital-electronics.csv`, `verilog.csv` databases).
   - The data source ID in `CLAUDE.md` and the skill belongs to the original workspace. On another workspace the skill searches by database name instead, so keep the names the same. Optionally replace the ID with the new one.
   - The database needs these properties: `Hook title` (title), `#` (number), `Interview question`, `Concept`, `Analogy` (text), `Book` (select), `Status` (select: Idea, Animation, Script), `Script`, `Html`, `Posted` (checkboxes).
4. **Environment:** in Claude Code on the web, add the repo under Repositories in your environment's settings so every new chat includes it. Python 3 is already in the cloud container; the checkers need nothing else.
5. **Use it:** start a new chat with the repo selected and type `/script video 14 chip design`.

## Rules that are easy to forget

- Every edit goes to Notion; the repo is the backup.
- The analogy pick always waits for you (SCRIPTS.md rule 0).
- Nothing is "ready" until `check-voice.py` and `check-page.py` both PASS and the reviewer's points are answered.
- After any voice edit: update the block and column 1, retime the rows, re-run both checkers.
