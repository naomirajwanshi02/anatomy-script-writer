# Reel scripts: the rules

Read before writing any script, voiceover, drawing plan or hook. CLAUDE.md covers how figures are built; this file covers the story, the ElevenLabs voice, the iPad drawing and the bookkeeping. Dates mark when a rule was set; a newer rule wins.

## 0. First step for every new script (2026-10-31)

- **Re-analyse the concept, then suggest the analogy, before writing anything.** Read the CSV row (Concept, Analogy, Interview question), restate the idea in one plain sentence, and name what actually makes it work. Then propose the best analogy: the everyday object whose own behaviour (or failure) shows exactly that mechanism, mapping 1:1 onto the circuit. Give 2-3 candidates with one line each on why they fit or break, recommend one, and wait for my pick. The CSV analogy is only a first idea.
- Test each candidate honestly: does the analogy show the real cause, not just the result? Would a viewer's obvious answer to the reel's question be the right one? (Ep 11: "the dog never reached car 2" was the obvious answer, so the copying world had to come first.)

## 1. Audience and brand

- **Viewer:** a 15+ short-form scroller who lands on one reel cold, has seen no other episode, and gives it about two seconds. Bar: a first-year BTech student follows every step; a non-engineer 15-year-old follows chip-design without pausing to think.
- **Platform:** Instagram reels (also LinkedIn, YouTube Shorts), 9:16, English; Meta AI dubs it to Hindi, so plain English only: no idioms, slang, puns or cultural references.
- **Brand:** sepia paper, brown ink, rust for active, yellow bulbs for lit; calm and precise; no hype words, no emojis on screen.
- **Tracks:** Digital Electronics (`series/digital-electronics.csv`), Verilog (`series/verilog.csv`, circuit only), chip-design (`series/book-concepts.csv`). Posting: DE 1-15 alone, then about 2 DE : 1 Verilog (each Verilog reel codes a circuit already shown), testbench and SystemVerilog last.
- **Who explains what:** the figure shows motion only, never explanation text. The voice says what to understand; my drawing shows where to look and carries the detail the voice skips (sums, lists, definitions, the reason behind a step). A note adds to the voice, never repeats it.

## 2. Beats (in order)

| Beat | Time | Rule |
|---|---|---|
| Hook | 0-4 s | The hook title, spoken. Chip-design: a concrete, true surprise or "What if…" about the analogy's own object (section 4). |
| Analogy | ~4-12 s | The everyday picture while it plays: what each part is, what happens. Plain words. |
| Series line | 2-3 s | A `[thoughtful]` 3-8 word takeaway, then DE/Verilog: "Welcome to episode N of Digital Electronics." Chip-design: "Let's understand this in episode N of chip design." (N as a word). No-analogy reels: series line right after the hook, then one short `[curious]` question into the circuit. |
| Fold | ~3 s | "[pause] Now, let's build it as a circuit." Chip-design: "[pause] Now, the same with bits." Then silence. |
| Circuit | ~20-40 s | Map each analogy part to its circuit part once, as the fold finishes; walk the key state as it happens. At most 2 new terms, each defined in the same sentence. |
| Answer | ~40-50 s | The one-line takeaway in plain words. |
| Real-world close | DE and Verilog only | Where the problem hits real devices. **Never in chip-design** (no real-world scene, voice, drawing or figure; spend the time explaining slower). |
| Teaser | last 3-5 s | Answers what the reel leaves open and leads to the next episode's object: "… That's episode N+1." |

- **Length:** DE and Verilog about 200 words (180-210), about 1.5 min. Chip-design 170-200 words with tags removed (digits and spaced letters count), about 60 s at voice speed 1.05-1.1. Cut words before clarity.
- **Show, then say (chip-design):** every step the voice names happens on screen at that moment, one step per sentence, none skipped. Reuse the analogy's words in the circuit. One worked example done slowly beats two done fast.

## 3. Voice rules (ElevenLabs)

- **Rule 1: FLOW comes first (2026-10-31).** Read the block aloud as one story; if any line could be swapped or dropped without the listener noticing, rewrite it.
  - Every beat picks up a word, question or promise from the one before. Never open a beat cold.
  - The line after the hook takes it up as the viewer's own question, in the hook's own words, never a phrase carried over from the previous teaser.
  - Never restate what the viewer has just seen. Move the story forward.
  - Set up a new idea before using it: no part, move or rule appears before a line introduces it.
  - No pronoun with an unclear owner. Name the thing.
  - Contrasts point back to the line they contrast with ("Every car behind follows." then "But no driver copies car one's wobble."). A what-if says "if" or "what if", never a bare claim.
  - At most one spoken link ("So", "But", "Now", "Watch") per beat, never two sentences in a row with the same one.
- **Speaking, not writing:** 6-15 words per sentence (never over 15), one idea each, active voice, present tense.
- **Episodes stand alone (2026-10-30):** never "from episode N", "like episode N", "remember". Reused objects are introduced again in plain words. Only the series line and the teaser name episodes.
- **One name per thing** everywhere (voice, notes, figure). No word a 14-year-old wouldn't know without a definition in the same sentence.
- **Spell for speech:** "Q bar", "S bar", "V D D", "ground", "N-moss", "P-moss", "C-moss", "NAND", "flip-flop"; "one zero one one", "two to one", "ten to the power nine", "nanoseconds". No raw symbols (Q̄, ·, ', ≥, arrows).
- **Honest:** every claim matches CLAUDE.md section 7; never claim more than the analogy shows. Say "one gate delay later", not seconds, unless time is the point.
- **No filler:** no "basically", "so yeah", "let's dive in", "in this video".
- **Model:** Eleven v3 (or v4), stability Creative or Natural, 2-3 takes. No SSML `<break>` tags.
- **Pauses:** paragraph break between beats; `...` for a short weighted pause; `[pause]` at most 3 per script (before the fold, before a real-world close), never two cues in a row.
- **Tags:** at most one emotion tag per beat. First line `[confident]` plus one CAPS word (never `[curious]` first: v3 reads it too quietly). `[curious]` teaser question; `[warmly]`/`[thoughtful]` analogy and answer; `[confident]` real-world close; `[slightly excited]` exactly once, on the key state (never `[excited]`); `[exhales]`/`[sighs]` rarely; `[pause, then normally]` to reset. No sound-effect, accent, singing or crying tags.
- **Emphasis:** at most one CAPS word per beat.
- **Block format:** plain text, one paragraph per beat, tags inline, nothing else.

## 4. Hook rules

- At most 9 words, sentence case, true, no clickbait, no emojis. The CSV hook title is both cover text and first spoken line (numbers said as the object shows them, one CAPS word).
- **Sets up its own cause (2026-10-31):** anything the hook says happened has a visible reason inside the hook.
- **Cold-viewer test:** read the first two lines to someone who has seen nothing. If they ask "what?" or "why?" about anything other than the reel's question, fix it. Every unfamiliar word is explained the moment it appears; every surprise is answered before the end.
- **The question must not be obvious:** if the viewer's easy answer is right, it is not a hook. Show the expected or failing case first so the real behaviour surprises.
- **Chip-design (2026-10-27):** name the analogy's object and state a concrete, true surprise about it, or a "What if…" whose answer is shown in the analogy. Never an abstract "why" about the concept, never an order to the viewer. Examples: "Your phone number has gaps for a reason", "What if your car's odometer goes back past zero?", "What if every car copied the wobble ahead?".
- **Second line (2026-10-28):** refers only to what the viewer has heard or seen; never gives away the chip's result (that comes after the fold). Good forms: the viewer's question plus "Let's watch.", a hint at what the chip does, or a definition the hook needs.
- **No bare question (2026-10-31):** the viewer's question names the hook's object and what it does, in the hook's words. Never a bare "How?" or "Why?" (ep 13: "How? Let's watch." after "Eight flats, one intercom, only THREE switches." asked how about nothing; fixed to "So how can three switches reach eight doorbells? Let's watch.").
- Keep the hook's object name everywhere after it. The previous teaser leads to this hook, but the hook works without it.

## 5. Drawing rules (iPad notes)

- **Colours:** words brown-black #2a1d10, arrows, rings and underlines olive #4f5d24, 3-4 px pen, handwriting in Samble. Never rust, yellow, blue or red.
- **Never over a part.** Words go in free paper above or below the board inside the safe area (y 288-1536 of 1920); on the board only pointers. Measure free space on a rendered frame.
- **Limits:** at most 3 notes on screen (the episode badge counts), at least 1.5 s between new notes, each up at least 2.5 s, nothing during a fold, wipe notes at each fold. Pen marks are not notes. Check second by second, not row by row. `npm run notes:check` must pass.
- **Size:** DE notes at most 4 words; chip-design at most 6 words or one short sum. Never a full sentence to read while the voice says something else; longer notes go in pauses or holds.
- **Each cue says** what (exact words or shape), where (relative to a named part) and which way an arrow points and what it stops short of. About one cue per 4-8 s, mostly in the circuit half, one large payoff cue near the end.
- **Naming a group (2026-10-27):** when the voice names a group, draw an olive square-cornered box round it on the word, about 12 px clear of every part, with the name just outside ("1 byte = 8 bits"). It stays until the voice moves to a new grouping.

## 6. Timing

- Video time = 3 s entrance + loop time (second pass: 3 + LOOP + loop time).
- Each line plays while its event is on screen or up to 0.5 s before it; never about an event not yet shown or long gone.
- The key-state hold is the longest; the key-state explanation sits on it.
- Planned times use about 3 words per second; after recording they are redone from the real word times.

## 7. Output format

**DE and Verilog:** (1) the ElevenLabs `text` block; (2) timing table Time | Voiceover | On screen | Draw, in video seconds; (3) ElevenLabs notes, at most 2 lines.

**Chip-design:** on the episode's Notion page, four sections in order:
1. **Detailed script:** numbered steps in story order, each with its plain idea, worked numbers and the why, marked V (voice), D (drawn) or F (figure); every step has a mark or is cut on purpose. Then the 15-year-old questions table (question, answered by V/D/F).
2. **ElevenLabs script:** the block, then notes (model, settings, word count, expected length).
3. **What to draw:** the drawing-rules line, then Step | Time | Voice | On screen | Draw, every note with an in and out time.
4. **HTML animation guidelines:** analogy object and why it fits; board, parts (about 8 max) and readouts (3 max) and their fonts; scene order with each F step and its hold; what model.ts computes; the fold and fold back to the start frame; free paper per step; folder and file name.

Order of work: detailed script, then recorded voice, then the figure time-scaled to it, then the notes fitted to their frames.

## 8. Checks before publishing (chip-design: record results in the handoff change log)

1. **Facts:** every number, code and claim computed in a scratch script, never by eye; matches CLAUDE.md section 7.
2. **Run `python3 script-writer/check-voice.py <file> --series chip --episode N`** on the block; it must PASS. For each WARN, rewrite the beat or say in the change log why it does not open cold. Then do the counts the script cannot see.
2. **Counts:** word range; no sentence over 15 words; tags, CAPS and `[pause]` limits; right series line and episode number; teaser leads to episode N+1's object.
3. **Read-aloud:** block read with tags removed against section 3 (flow, links, one name per thing).
4. **15-year-old pass:** after every sentence, write the question a curious non-engineer would ask; answer it at that moment (V, D or F), or cut the sentence that raised it. Every term defined on first use; every recipe gets its why.
5. **Sync:** every spoken claim has its F or D at that moment; every F step is in the HTML guidelines in order; every named group has its box.
6. **Quotes:** after any voice edit, re-read every quote on the page against the block; a quote of a cut line is a bug.
7. **Publish:** Status = Script, hook title set in Notion and the CSV, handoff page updated.

## 9. Annotating a recorded episode (mp3 + HTML in, reel out)

1. Transcribe (`npm run notes:transcribe`); check against the page's block; the recording wins for timing; report differences.
2. Sync the figure to the voice (`voice.ts`); each on-screen event lands on its line.
3. Re-anchor each note to its quoted word (up to 0.5 s early), keep its planned length, re-check limits second by second.
4. Place notes on rendered frames (CLAUDE.md section 11); use each note's exact text; if one cannot fit, report it rather than reword.
5. End card in the last 4 s, export, update the handoff page and `series/reel-builds.csv`.

## 10. Analogies and CSVs

- Use an analogy for flow, timing, storage or noise, where an honest everyday picture folds straight into the circuit; definitions and truth tables stay circuit-only. Reuse a world across episodes (water for transistors and latches, seesaw for SR states, runners for timing). Each analogy part maps to one circuit part, named once at the fold.
- CSV columns: DE and Verilog have Hook title, #, Interview question, (Analogy), Status, Done, Real-world close. Chip-design: Hook title, #, Interview question, Concept, Analogy, Book, Page, Status, Done, Set Tempo, Matched to Tempo.
- Status: Idea, Animation, Script, Recorded, Posted. Keep commas inside fields quoted; never reorder rows or renumber episodes.
