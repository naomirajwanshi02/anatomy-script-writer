# Reel script kit (script writing only)

This folder is the script part of the reel project. Only `/script` works here; the figure, render and reel tools (`src/`, `builds/`, `/htmlmp4`) are not included.

## Set up

1. Unzip into an empty folder and open that folder in Claude Code (desktop app Code tab, CLI or claude.ai/code with the folder in a repo). Keep the hidden `.claude` folder.
2. Install Python 3 (the checkers need nothing else).
3. Connect Notion (claude.ai Settings > Connectors > Notion) and share the **Shorts** page with the `book-concepts.csv`, `digital-electronics.csv` and `verilog.csv` databases. On another workspace the skill finds the databases by name, so keep the names.
   - Without Notion the skill stops. Then ask Claude to follow `script-writer/SCRIPT-WRITER.md` section 2 instead: it writes the page as `scripts/<NN> <interview question>.md` for you to paste into Notion.

## Use

Type `/script video 20 chip design` (or `/script 5 digital electronics`, `/script verilog 3`). Claude proposes 2-3 analogies and waits for your pick, then writes the page, runs the checkers and saves it.

## What is inside

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
