# HANDOFF for the Claude desktop session (D:/Anatomy)

From the cloud script session, 2026-11-02. Claude: read this whole file first, then do section 1 once, then section 2 for each episode as the owner sends a voice take. Follow CLAUDE.md as always: edit in place, short replies, no git on the laptop. The owner reviews the visuals.

Repo: <https://github.com/naomirajwanshi02/anatomy-script-writer/tree/claude/brave-ritchie-1peex2> (README.md has the full background; this file is the working checklist).

## 0. Where things stand

| # | Figure (`src/figures/`) | Script (Notion) | Voice | Reel |
|---|---|---|---|---|
| 11 | `regen-convoy2` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 12 | `full-adder-columns` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 13 | `decoder-intercom` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 14 | `priority-phone` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 15 | `tristate-tank` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 16 | `switching-threshold-taps` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 17 | `bucket-stairs` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 18 | `short-circuit-taps` | rewritten 2026-11-03 (house style, visual hook, sign-off) | re-record | rebuild |
| 19 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 20 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 21 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 22 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 23 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 24 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 25 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 26 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 27 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 28 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 29 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |
| 30 | none yet | rewritten 2026-11-03 (house style, visual hook, sign-off) | record | build |

- The Notion page of each episode (`book-concepts.csv`) is the source of truth: voice block, **On the board** (figure brief), **Annotation** (exact marks). The same pages are in `scripts/` here.
- **`/htmlmp4` always follows the Notion page and the voice (2026-11-03):** it re-fetches the page every run, diffs it against the last built copy (`script-writer/page-diff.py`) and applies every change; every figure event is timed from its spoken words (`node builds/notes/annotations.mjs board <page> <words.json>`), never from the page's planned seconds (SCRIPTS.md section 6). 11's page has a new visual hook (dog first, then car 1 shakes, car 5 steady).
- **Endings (2026-11-03):** no next-episode teaser. Every reel ends on a bridge that repeats a hook word, then the fixed sign-off "Now you can explain what most engineers can't. Follow, and keep it that way." On screen, the end card's "Episode N+1 →" is replaced by the sign-off sequence: the "1 : 0" scoreboard pun ("you 1, most engineers 0", on "you … can't"), then a handwritten "Follow" with an arrow to the follow button and a double underline with sparks on "keep it that way". Generate it with `npm run notes:signoff -- <words.json>` and paste its entries into the cue file (builds/notes/README.md section 4).
- **Visual hook (2026-11-03):** cold open (the hook note writes from frame 0), board events after the landing (1.6 s), 20 px minimum motion; SCRIPTS.md section 4.
- **House script style (2026-11-03):** SCRIPTS.md section 3a. Scripts sound like a friend explaining: the flip ("…, right? Nope."), 1-3 word punches, a turn phrase ("Here's the weird part."), "Because/See/So" openers, two viewer questions. `check-voice.py` prints a TONE score (aim 80+) and rejects dub-breaking idioms. 11-30 are all rewritten in it (2026-11-03, TONE 80-100, each ending on the sign-off). Platform is Instagram Reels and YouTube Shorts.
- What changed in 11-18: a new hook, a second line, split lines, a teaser that loops, new captions. Row 1 of each page now has a `Visual hook:` sentence with events in the first 3 s. Facts, analogies, numbers and the circuit halves are unchanged. Per-episode details: README.md section 2.

## 1. Once: copy the update into D:/Anatomy

47 files differ from `reel-kit.zip` (the folder the owner uploaded). Copy each into `D:/Anatomy` at the same path, overwriting the old one. Nothing else in the folder changes and no `npm install` is needed. PowerShell, run from `D:/Anatomy`:

```powershell
$base = 'https://raw.githubusercontent.com/naomirajwanshi02/anatomy-script-writer/claude/brave-ritchie-1peex2/'
$files = @(
  '.claude/skills/htmlmp4/SKILL.md',
  'builds/notes/README.md',
  'builds/notes/annotations.mjs',
  'builds/notes/episodes/chip-design/13.page.md',
  'builds/notes/episodes/chip-design/14.page.md',
  'builds/notes/episodes/chip-design/15.page.md',
  'builds/notes/episodes/chip-design/16.page.md',
  'builds/notes/episodes/chip-design/17.page.md',
  'builds/notes/episodes/chip-design/18.page.md',
  'package.json',
  'series/reel-builds.csv',
  'src/figures/bucket-stairs/live.tsx',
  'src/figures/decoder-intercom/live.tsx',
  'src/figures/priority-phone/live.tsx',
  'src/figures/short-circuit-taps/live.tsx',
  'src/figures/switching-threshold-taps/live.tsx',
  'src/figures/tristate-tank/live.tsx',
  '.claude/skills/script/SKILL.md',
  'README.md',
  'scripts/13 What does a decoder do in a memory chip.md',
  'scripts/15 What is a tri-state buffer and why does a bus need it.md',
  'scripts/16 What sets the switching threshold of a CMOS inverter.md',
  'scripts/17 Why does lowering supply voltage save so much power.md',
  'scripts/18 What is short-circuit power in CMOS.md',
  'scripts/19 What is subthreshold leakage.md',
  'series/book-concepts.csv',
  'builds/notes/episodes/chip-design/11.old.words.json',
  'builds/notes/episodes/chip-design/12.old.words.json',
  'builds/notes/episodes/chip-design/13.old.words.json',
  'builds/notes/episodes/chip-design/14.old.words.json',
  'builds/notes/episodes/chip-design/15.old.words.json',
  'builds/notes/episodes/chip-design/16.old.words.json',
  'builds/notes/episodes/chip-design/17.old.words.json',
  'builds/notes/episodes/chip-design/18.old.words.json',
  'builds/notes/retake.mjs',
  'builds/notes/spell.mjs',
  'script-writer/ig/LICENSE',
  'script-writer/ig/beats.py',
  'script-writer/ig/caption.py',
  'scripts/11 What is the regenerative property of logic gates.md',
  'scripts/12 How does a full adder work.md',
  'scripts/14 What is a priority encoder.md',
  'scripts/20 How do you drive a large capacitive load quickly.md',
  'scripts/21 Why does wire delay grow with the square of length.md',
  'HANDOFF.md',
  'CLAUDE.md',
  'SCRIPTS.md',
  'script-writer/SCRIPT-WRITER.md',
  'script-writer/check-voice.py',
  'script-writer/check-page.py',
  'script-writer/page-diff.py',
  'builds/notes/check.mjs',
  'builds/notes/autoplace.mjs',
  'rules/notes.md',
  'script-writer/ANNOTATIONS.md',
  'script-writer/SETUP.md',
  'builds/notes/signoff.mjs',
  'builds/notes/notes-kit.mjs'
)
foreach ($f in $files) {
  $dest = Join-Path 'D:/Anatomy' $f
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Invoke-WebRequest -Uri ($base + [uri]::EscapeDataString($f).Replace('%2F','/')) -OutFile $dest
}
```

Then check: `node --check builds/notes/retake.mjs` and `node --check builds/notes/annotations.mjs` print nothing; `npm run build:bucket-stairs` builds.

What the update is (details in README.md section 4):
- `builds/notes/annotations.mjs` + new `builds/notes/spell.mjs`: marks cued on numbers above twenty ("fifty-eight", "sixty-four", "a hundred and three") now resolve against Whisper's digits; same results as before on 13-18.
- New `builds/notes/retake.mjs` (`npm run notes:retake`): moves a figure built on the old take onto the new take.
- `setTimeMap` hook in the `live.tsx` of the six figures of 13-18 (no change without a voice page).
- `builds/notes/episodes/chip-design/NN.old.words.json` (11-18): the old takes' transcripts, needed by `notes:retake`.
- `.claude/skills/htmlmp4/SKILL.md`: the re-take path. `series/reel-builds.csv`: cd11-cd18 marked `script revised: re-record, rebuild`.

## 2. Per episode, after the owner records the voice

Run `/htmlmp4 chip N <mp3>` in a new chat. For 11-18 it takes the re-take path; in short:

1. Fetch the page from Notion, save as `builds/notes/episodes/chip-design/NN.page.md`; `check-page.py` and `check-annotations.py` must PASS (they do today).
2. Transcribe: `npm run notes:transcribe -- "<mp3>" builds/notes/episodes/chip-design/NN.words.json` (the old one is safe in `NN.old.words.json`).
3. Re-take map: `npm run notes:retake -- builds/notes/episodes/chip-design/NN.old.words.json builds/notes/episodes/chip-design/NN.words.json --write <figure>`, then `node builds/build-<figure>-voice.mjs`. Every existing event now lands on the new take.
4. Add only the new events from the page, in the figure's own timeline (old-take seconds, inside the new-only spans the tool prints): row 1 `Visual hook:` and any changed cue word (11: the opening order changes, solid convoy first and ghost copying convoy on line 2; 12: small retime; 13, 14, 17, 18: visual hook; 15, 16: small retime). Owner reviews one sheet before going on.
5. Annotations: write `NN.mjs` fresh from `node builds/notes/annotations.mjs plan <page.md> <words.json>` (never patch the old cue), place, `notes:check`, understanding test, sign-off, owner OK, export, update `series/reel-builds.csv` and Notion `Html`.

19, 20 and 21 have no figure: `/htmlmp4` builds them from the page (two-panel sample, then spec, owner OK each time).

## 3. Known open items (leave unless the owner asks)

- Over the chip-design annotation cap: 13, 15, 17, 18 (more than 5 pen marks); 17 and 18 (more than 20 notes).
- The Samble font files are not in the repo (no licence for public sharing); use the local `D:/Anatomy/samble/`.

## 4. When done

Reply to the owner per episode in at most 5 lines (files, sign-off, transcript differences, seconds to look at). The owner sends the next take.
