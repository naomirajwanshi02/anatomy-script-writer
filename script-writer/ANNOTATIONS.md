# Annotations: design rules (read before writing or building any annotation)

Annotations are the hand-drawn layer over the figure: Samble words and olive pen marks, as if a teacher scribbles on the screen while talking. They are planned in the Annotation column of the episode's Notion page (`/script`) and built into the reel by `/htmlmp4`. These rules win over older note rules in SCRIPTS.md and `builds/notes/README.md` where they differ; the enforced overlap rules (`npm run notes:check`, R1-R8) still apply on top.

## 1. What an annotation is for

**Reference (owner, 2026-11-02): chip-design episodes 01-07** (`builds/notes/episodes/chip-design/01.mjs` to `07.mjs`). Copy their style: 15-20 notes and 3-8 pen marks in a 70 s reel; the notes are the explanation written on paper: definitions in proper terms ("hex = base 16", "1 hex digit = 4 bits"), the rule or formula ("Rule 2 = NOT(L AND R)"), each step of the worked example on its own line ("8 + 0 + 2 + 1 = 11 = B"), and mapping lines ("door = bit: 1 shut, 0 open").

Every mark must read in one glance at phone size while the viewer keeps listening. In the analogy half the reader is a 15-year-old; in the circuit half it is a first-year BTech student learning the real circuit (UNDERSTANDING-TEST.md). Every mark does one of five jobs:

| Job | Example | Mark |
|---|---|---|
| **Point** at the part the voice names | "the PMOS" | arrow from a short label, or a ring |
| **Group** parts the voice names together | "three bits of the address" | square-cornered box with the group's name just outside |
| **Count or sum** what the picture shows | "2 x 2 x 2 = 8 flats", "1 0 1 = 5" | short note, underlined or arrowed to what it counts |
| **Name the state** the hook or key moment is about | "handle halfway", "only row 5" | short note plus the episode's one key mark |
| **Work it out**: a definition, the rule or formula, or one step of the worked example (01-07 style) | "hex = base 16", "0111 = 4+2+1 = 7", "charge = C x V" | a line in free paper, no tie needed |
| **Label a part** with the word the voice gives it, on the part (DE 01-02 style); in the circuit half, its real term and its analogy partner | "2 levels: off / on", "VDD = roof", "PMOS on", "charge = C x V" | 2-3 word label on an arrow |

Anything that is none of these (a sentence that explains, a second wording of a whole voice sentence) is not drawn.

## 2. Hand-drawn, not captions

- **Notes that name or point at a part are tied to it** by an arrow, underline or box. Worked steps, definitions and rules written in free paper may stand without a tie, as in chip-design 01-07 (they read as working on paper, not as captions). A note that only repeats a whole voice sentence is never drawn.
- **Pen first, then words**: the stroke starts on the cue word and the words ink about 0.2-0.4 s later, so it looks drawn in order.
- Doodles make it feel hand made and are welcome (DE 01-02 have many): glass of water for water analogies, bulb for light, squiggle for noise, wavy underlines, ticks; never on a part.
- One **key mark** per episode: the biggest ring, box or wavy underline, on the key state (the one that answers the question). Tag it `key`.

## 3. Easy to read (15+, phone size)

- **Short:** at most 6 words in chip-design (01-07 run 4-6), 4 in digital electronics and Verilog. Numbers, `=`, `+`, `x` and `→` do not count as words and are preferred to words ("3→8" beats "three wires pick eight").
- **Plain in the analogy half:** only words the voice has said or a 14-year-old knows.
- **Proper terms in the circuit half:** label each real part with its proper name (VDD, GND, PMOS, NMOS, output, charge = C x V, energy) when the voice names it or when it first appears, and tie it to its analogy partner where that helps ("VDD = roof").
- **One name per thing:** the note uses the voice's and the figure's name for the part ("word line", not "WL" or "select line").
- **Labels may echo, notes may not repeat:** a label of 1-3 words may write the voice's key word on the part it names (that is how DE 01-02 read). A note of 4 or more words must not repeat 3 words in a row from the voice in the same or the next row; it adds what the ear cannot hold (a sum, a count, a mapping).
- **Cold open (owner, 2026-11-03):** the hook note writes itself from the first frame (0 s), in the top zone above the board, done by about 1.3 s; the CAPS word's underline under it comes on the spoken CAPS word. Every other mark waits for the landing (1.6 s). SCRIPTS.md section 4, visual hook.
- **Size:** hook note 64-84 px, notes 42-48 px, never below 40. Sentence case, no full stop.
- **Characters:** Samble has no "≈", "−" (U+2212) or "×": write "about", "-" and "x".

## 4. Non-intrusive (calm frame)

- **Never over a part, label or readout.** Words sit in free paper: above the board (y 300-760), below it (y 1200-1500) or beside a part with room. On the board only strokes. Arrow tips stop 10-15 px short of the part and never on an engraved label.
- **End card:** boxed takeaway in the subtitle area (y about 1408), 4 s before the end. **Sign-off sequence (owner, 2026-11-03, replaces "Episode N+1 →"):** during the sign-off, the "1 : 0" scoreboard pun (owner, 2026-11-03): "final score" and "you" write on "you", a big "1" on "explain", "most engineers" on "most", a big "0" on "can't", in the top zone above the board; then the follow prompt: on the spoken word "Follow", "Follow" writes itself in Samble at y about 1530 (x about 530), clear of both apps' bottom strip (one video for Reels and Shorts), with a short olive arrow pointing down-left toward the corner where both apps put their follow/subscribe button (tip at about x 300, y 1625); on "keep it that way" a double olive underline and three small sparks. "Follow" line-boils (`{ alive: true }`) to the end. None of it is planned on the page: `npm run notes:signoff -- <words.json>` prints every entry timed from the recording, and the checks treat the group `signoff` like the old episode card. When a readout fills the subtitle area, the takeaway takes the hook's spot (`above right` with the tag `end card`) and the badge leaves before it. Chip-design has no written interview answer block (owner, 2026-11-02); the end card is the only takeaway.
- **Safe area:** nothing in y 0-288 or 1536-1920 except the badge (y about 330, top right) and the end card's sign-off sequence ("Follow" at y about 1530, its arrow tip at y about 1625).
- **Chip-design cap (2026-11-02, from the ep 4 analysis; overrides the density bullet below for chip-design):** at most 20 notes and 5 pen marks in a 70 s reel (ep 4: 18 notes, 3 marks; 17 and 18 had 30-33 notes and 26-39 marks and read busy), about one new note every 3.5-4 s. Each note is one line in the free paper band above or below the board; no grouped two-line notes. No arrows or rings onto a part that already has an engraved label; a note naming a part sits beside it instead. Physics formulas and volt/amp values are not drawn (SCRIPTS.md section 10, plain numbers).
- **Density, like chip-design 01-07 and DE 01-02 (2026-11-02):** 15-20 notes in a 70 s reel plus pen marks where they point, about one new mark every 2-3 s, no gap of more than 6 s without a new mark outside folds; at most 4 notes on screen (the badge counts, pen marks do not), at least 1.0 s between new notes, each note up at least 2.0 s. Cue files set `crowd: { max: 4, gap: 1.0 }` so `notes:check` (R7, R8) uses these limits.
- **Folds:** nothing new during a fold; every note and mark of a phase leaves at the fold start (the badge stays).
- **Rings and boxes** only once the part has landed and settled; boxes about 12 px clear of every part, square-cornered, following the board slope.
- **Clutter:** at most about 8 marks plus notes on one frame; if more, cut doodles or merge notes.
- **Colours:** words brown-black #2a1d10, every stroke olive #4f5d24, 4 px. Never rust, yellow, blue or red.

## 5. The Annotation column format (one mark per line)

Each mark is one line in the Annotation cell; lines in one cell are joined with `<br>`. Fields are separated by ` · `. Times in brackets are the planned video seconds (about 3 words per second); `/htmlmp4` re-times every mark from its quoted words in the real recording.

```
NOTE "<words>" · on "<spoken words>" (<s>) · out <when> · <place> · tie <arrow to PART | underline | box | none> [· hook | badge | end card | key | group NAME]
PEN <shape> · on "<spoken words>" (<s>) · <round PART | to PART | under "<note words>"> · out <when> [· key]
```

- `on "<spoken words>"`: 1-4 words spoken in the same row; the mark starts on them. The end card uses `at end-4 (<s>)` instead.
- `out <when>`: `"<spoken words>" (<s>)` (a later cue), `fold (<s>)` (the next fold start) or `end`.
- `<place>` (NOTE): `above left`, `above centre`, `above right`, `below left`, `below centre`, `below right`, `left of PART`, `right of PART`, `outside the box`, `top right` (badge only), `end card`.
- `<shape>` (PEN): `ring`, `box`, `arrow`, `underline`, `wave`, `tick`, `cross`, `glass`, `bulb`, `squiggle`.
- `tie arrow to PART` makes `/htmlmp4` draw that arrow with the note; a separate PEN line is only for marks that are not a note's tie (a ring on a part, a group box, a doodle).
- PART is the name used in the On the board column ("row 5 lamp", "the three levers").
- A cell with no new mark says `Nothing new.`

Example row (episode 13, planned):

```
NOTE "2 x 2 x 2 = 8 flats" · on "wings A" (7.4) · out "The guard's" (14.2) · above left · tie arrow to building
PEN box · on "three switches" (12.3) · round the three levers · out "Every doorbell" (18.4)
NOTE "3 switches, 2 ways each" · on "three switches" (12.6) · out "Every doorbell" (18.4) · outside the box · tie box
```

## 6. Checks

- `/script`: `python script-writer/check-annotations.py page.md --series chip` must PASS before the page goes to Notion (format, words, ties, no voice repeat, cue words spoken, density, folds, end card, key mark).
- `/htmlmp4` final sign-off, all three must PASS:
  1. `python script-writer/check-annotations.py page.md --series <s>` on the page as saved in Notion;
  2. `node builds/notes/annotations.mjs signoff <page.md> <words.json> <cue.mjs>`: every planned mark is in the cue file with the same words, starts within 0 to 0.5 s after its spoken words, ties drawn, nothing extra unplanned;
  3. `npm run notes:check -- "<notes page>"` (R1-R8 overlaps and crowding).
