# Reel scripts: the rules

Read before writing any script, voiceover, drawing plan or hook. CLAUDE.md covers how figures are built; this file covers the story, the ElevenLabs voice, the iPad drawing and the bookkeeping. Dates mark when a rule was set; a newer rule wins.

## 0. First step for every new script (2026-10-31)

- **Re-analyse the concept, then suggest the analogy, before writing anything.** Read the CSV row (Concept, Analogy, Interview question), restate the idea in one plain sentence, and name what actually makes it work. Then propose the best analogy: the everyday object whose own behaviour (or failure) shows exactly that mechanism, mapping 1:1 onto the circuit. Give 2-3 candidates with one line each on why they fit or break, recommend one, and wait for my pick. The CSV analogy is only a first idea.
- Test each candidate honestly: does the analogy show the real cause, not just the result? Would a viewer's obvious answer to the reel's question be the right one? (Ep 11: "the dog never reached car 2" was the obvious answer, so the copying world had to come first.)

## 1. Audience and brand

- **Viewer:** a 15+ short-form scroller who lands on one reel cold, has seen no other episode, and gives it about two seconds. Bar: a first-year BTech student follows every step; a non-engineer 15-year-old follows chip-design without pausing to think.
- **Platform:** Instagram reels and YouTube Shorts, 9:16, English; Meta AI dubs it to Hindi, so plain English only: no idioms, slang, puns or cultural references (the story devices in section 3a are allowed).
- **Brand:** sepia paper, brown ink, rust for active, yellow bulbs for lit; precise, told like a friend's story (section 3a); no hype words, no emojis on screen.
- **Tracks:** Digital Electronics (`series/digital-electronics.csv`), Verilog (`series/verilog.csv`, circuit only), chip-design (`series/book-concepts.csv`). Posting: DE 1-15 alone, then about 2 DE : 1 Verilog (each Verilog reel codes a circuit already shown), testbench and SystemVerilog last.
- **Who explains what:** the figure shows motion only, never explanation text. The voice says what to understand; my drawing shows where to look and carries the detail the voice skips (sums, lists, definitions, the reason behind a step). A note adds to the voice, never repeats it.

## 2. Beats (in order)

| Beat | Time | Rule |
|---|---|---|
| Hook | 0-4 s | The hook title, spoken. Chip-design: a concrete, true surprise or "What if…" about the analogy's own object (section 4). |
| Analogy | ~4-12 s | The everyday picture while it plays: what each part is, what happens. Plain words. |
| Series line | 2-3 s | A `[thoughtful]` 3-8 word takeaway, then DE/Verilog: "Welcome to episode N of Digital Electronics." Chip-design: "Let's understand this in episode N of chip design." (N as a word). No-analogy reels: series line right after the hook, then one short `[curious]` question into the circuit. |
| Fold | ~3 s | "[pause] Now, let's build it as a circuit." Chip-design: "[pause] Now, the same with bits." Then silence. |
| Circuit | ~20-40 s | **A real circuit, explained in the context of the analogy (2026-11-02).** The fold lands on the actual circuit (rails, transistors, the wire and its capacitance, gates, readouts), never the analogy object relabelled. Each spoken line explains one real part or step in proper terms (VDD, GND, PMOS, NMOS, charge = C x V, energy) and ties it to what the analogy showed ("the supply's voltage is the roof"); the analogy part may appear as a ghost or label beside its circuit part. **Circuit design language (owner, 2026-11-02):** draw the circuit exactly like the digital electronics CMOS figures (DE 05 "How does a CMOS inverter work", DE 08 "Why does CMOS use almost no power when idle"): a clean flat board, VDD rail at the back and GND at the front, input lever, PMOS and NMOS valve blocks, the glass output tank on the output node, an output lamp where it helps, and DE-style readouts (a table with the current row highlighted, a waveform graph, an "I from VDD" meter). Take the concept from the analogy, never its objects: no stairs, buckets, drops climbing a source or other analogy devices built into the circuit; the circuit shows the concept with its own quantities (tank level = charge, the VDD label and rail = voltage, readouts = current and energy). Walk the key state as it happens. Audience: the analogy is for a 15-year-old, the circuit teaches a first-year BTech student. |
| Answer | ~40-50 s | The one-line takeaway in plain words. |
| Real-world close | DE and Verilog only | Where the problem hits real devices. **Never in chip-design** (no real-world scene, voice, drawing or figure; spend the time explaining slower). |
| Sign-off | last 5-6 s | **(owner, 2026-11-03)** `[confident]`, one short bridge from this reel (at most 8 words) that repeats a hook word, so the reel loops (ep 11: "No shakes, just clean bits."), then the fixed sign-off, word for word: "Now you can explain what most engineers can't. Follow, and keep it that way." No next-episode teaser: a new viewer has never seen another episode. On screen (no page rows needed): the "1 : 0" scoreboard pun (owner, 2026-11-03): "final score" and "you" write on "you", a big "1" on "explain", "most engineers" on "most", a big "0" on "can't", in the top zone above the board, then "Follow" with an arrow to the follow button and a double underline with sparks on "keep it that way" (ANNOTATIONS.md, end card; `/htmlmp4` builds it with `npm run notes:signoff`). |

- **Length:** DE and Verilog about 200 words (180-210), about 1.5 min. Chip-design 170-200 words with tags removed (digits and spaced letters count), about 60 s at voice speed 1.05-1.1. Cut words before clarity.
- **Show, then say (chip-design):** every step the voice names happens on screen at that moment, one step per sentence, none skipped. Reuse the analogy's words in the circuit. One worked example done slowly beats two done fast.

## 3. Voice rules (ElevenLabs)

- **Rule 1: FLOW comes first (2026-10-31).** Read the block aloud as one story; if any line could be swapped or dropped without the listener noticing, rewrite it.
  - Every beat picks up a word, question or promise from the one before. Never open a beat cold.
  - The line after the hook takes it up as the viewer's own question, in the hook's own words.
  - Never restate what the viewer has just seen. Move the story forward.
  - Set up a new idea before using it: no part, move or rule appears before a line introduces it.
  - No pronoun with an unclear owner. Name the thing.
  - Contrasts point back to the line they contrast with ("Every car behind follows." then "But no driver copies car one's wobble."). A what-if says "if" or "what if", never a bare claim.
  - At most one spoken link ("So", "But", "Now", "Watch") per beat, never two sentences in a row with the same one.
- **Speaking, not writing:** 6-15 words per sentence (never over 15; the 1-3 word punches of section 3a are the exception), one idea each, active voice, present tense.
- **Episodes stand alone (2026-10-30):** never "from episode N", "like episode N", or "remember" about another episode ("Remember the lane lines?" inside the same reel is fine, section 3a). Reused objects are introduced again in plain words. Only the series line names an episode.
- **One name per thing** everywhere (voice, notes, figure). No word a 14-year-old wouldn't know without a definition in the same sentence.
- **Spell for speech:** "Q bar", "S bar", "V D D", "ground", "N-moss", "P-moss", "C-moss", "NAND", "flip-flop"; "one zero one one", "two to one", "ten to the power nine", "nanoseconds". No raw symbols (Q̄, ·, ', ≥, arrows).
- **Honest:** every claim matches CLAUDE.md section 7; never claim more than the analogy shows. Say "one gate delay later", not seconds, unless time is the point.
- **No filler:** no "so yeah", "let's dive in", "in this video". "Basically" at most once, as the plain restatement (section 3a).
- **Model:** Eleven v3 (or v4), stability Creative or Natural, 2-3 takes. No SSML `<break>` tags.
- **Pauses:** paragraph break between beats; `...` for a short weighted pause; `[pause]` at most 3 per script (before the fold, before a real-world close), never two cues in a row.
- **Tags:** at most one emotion tag per beat. First line `[confident]` plus one CAPS word (never `[curious]` first: v3 reads it too quietly). `[curious]` for a question the viewer would ask; `[confident]` sign-off; `[warmly]`/`[thoughtful]` analogy and answer; `[confident]` real-world close; `[slightly excited]` exactly once, on the key state (never `[excited]`); `[exhales]`/`[sighs]` rarely; `[pause, then normally]` to reset. No sound-effect, accent, singing or crying tags.
- **Emphasis:** at most one CAPS word per beat.
- **Block format:** plain text, one paragraph per beat, tags inline, nothing else.

## 3a. Tone: a friend explaining (2026-11-03, the house script style)

Measured from about 9,000 words of a long-form explainer channel the owner likes (four videos, one creator), scaled to one 170-200 word reel. The hook stays as section 4 (80+, STRONG); everything after it sounds like a friend explaining across a table, not a lecture. The rates are what a reel should hit; `check-voice.py` prints a **TONE score out of 100** (20 per scored row) and warns on each miss. Aim for 80+. Tone never beats truth: a casual line still says exactly what the old line said.

| Move (scored) | Per reel | Examples |
|---|---|---|
| **Flip:** agree with the viewer's easy guess, then turn it | 1 | "The next gate passes that on, right? Nope." / "More repeaters, more speed, right? Not quite." / "Sounds fair, right? Well, not exactly." |
| **Punch:** a 1-3 word line right after a longer one | 1-2 | "Nope." "Dead straight." "Really fast." "Under half." |
| **Turn phrase** before the surprising step | 1 | "Here's the thing." "Here's the weird part." "Here's how it works." "But wait, it gets worse." "So what's going on?" |
| **Chat openers** carry the explanation | 2-4 sentences | "Because…" (his most used opener), "See,…", "So…", "Now,…", "Okay." "Well,…" |
| **Questions** the viewer would ask, answered at once (sign-off not counted) | 2 | "So how does car five stay straight?" "Inside a lane? It barely cares." "Total wait? Forty-five ticks." |

Also use, not scored:
- **Question-then-answer fragment:** "Total wait? Forty-five ticks." (counts as a question).
- **Lists of three:** "No hand, no tap, no switch." "More taps, more pipe, more wait."
- **"Think of it like…" / "Imagine…"** for any extra everyday comparison inside the analogy.
- **Plain restatement:** "Basically," or "In other words," at most once each, 12 words or fewer.
- **Talk to the viewer:** "you", "your phone", "your key"; the stakes in one line when there is room (why it matters to them, or the interview answer).
- **Callback** in the circuit half to an analogy part by name: "Remember the lane lines?"
- **"just"** as a softener, at most twice.
- **Rhythm:** most sentences 6-12 words (never over 15, section 3), broken by the punches.

Never:
- **The character opener** "This is X, and he's got a huge problem" (it scores WEAK as a hook) or a person added just for style. A person appears only when the analogy really has one acting (filling, pressing, steering); then he is Harry, the one recurring name, never a real person's surname or a famous single name, drawn as a flat 2D side profile (SCRIPT-WRITER.md 3).
- **Idioms and slang** that break the Hindi dub (section 1): "the math is not mathing", "suffering from success", "gold rush", "hit the fan", "drink the Kool-Aid", "par for the course", "smoke and mirrors", "holding the bag", "monkey business", "cut out for him". `check-voice.py` rejects these.
- **Swearing:** none by default (the reference uses about one per 2,000 words, so a reel almost never earns one). At most one "hell" or "damn", never in the hook; nothing stronger.
- **Sarcasm about real people or companies**, legal jokes, sponsor-style asides.
- **More than one reaction** ("Wait, what?", "Hold on.") per reel; a reaction is a punch, not a habit.

## 4. Hook rules

- At most 9 words, sentence case, true, no clickbait, no emojis. The CSV hook title is both cover text and first spoken line (numbers said as the object shows them, one CAPS word).
- **Sets up its own cause (2026-10-31):** anything the hook says happened has a visible reason inside the hook.
- **Cold-viewer test:** read the first two lines to someone who has seen nothing. If they ask "what?" or "why?" about anything other than the reel's question, fix it. Every unfamiliar word is explained the moment it appears; every surprise is answered before the end.
- **The question must not be obvious:** if the viewer's easy answer is right, it is not a hook. Show the expected or failing case first so the real behaviour surprises.
- **Chip-design (2026-10-27):** name the analogy's object and state a concrete, true surprise about it, or a "What if…" whose answer is shown in the analogy. Never an abstract "why" about the concept, never an order to the viewer. Examples: "Your phone number has gaps for a reason", "What if your car's odometer goes back past zero?", "What if every car copied the wobble ahead?".
- **Form of the hook (chip-design, 2026-11-02, from the ep 4 analysis):** best form is "Your <everyday object> never/always <a visible oddity>. Why?" (ep 4: "Your alarm clock never shows 07:3A. Why not?"): second person, a fact the viewer can check on their own object, ending as a question. Never state the mechanism or the result of a scene the viewer has not seen yet (17 "Half-height building, a quarter of the climbing", 18 "A slow handle sends water straight down the drain" were weaker). The second line never repeats the hook as a question. The answer comes back in the last 15 s in the hook's own words, with a tick (ep 4: "That's why your clock never shows A").
- **Second line (2026-10-28):** refers only to what the viewer has heard or seen; never gives away the chip's result (that comes after the fold). Good forms: the viewer's question plus "Let's watch.", a hint at what the chip does, or a definition the hook needs.
- **No bare question (2026-10-31):** the viewer's question names the hook's object and what it does, in the hook's words. Never a bare "How?" or "Why?" (ep 13: "How? Let's watch." after "Eight flats, one intercom, only THREE switches." asked how about nothing; fixed to "So how can three switches reach eight doorbells? Let's watch.").
- **Visual hook (row 1 of On the board, owner 2026-11-03, from ep 11):** what the eye gets in the first 3 s, while the voice says the hook. The voice starts at 0 s, over the entrance (the board rises and its parts fall, landing at 1.35 s with a short shake, settled by 1.6 s).
  - **Ink from frame 0 (the cold open):** the hook note (the NOTE tagged `hook`) starts writing itself on the first frame, in the top zone above where the board lands (place `above left` or `above right`, y about 300-600), and finishes by about 1.3 s, so the first frame and the muted first second already carry the surprise. Its words state the surprise on their own (picture plus note readable with the sound off), at most 6 words, never 3 voice words in a row. The hook's CAPS word gets an olive underline under its counterpart in the note, on the spoken CAPS word (`PEN underline · on "SHAKES" (…) · under "shaky" · out …`: under the hook note's counterpart word). The iPad layer sits above the figure, so falling parts never cover the ink. These two are the only marks before 1.6 s.
  - **Board events start after the landing:** row 1 gives 2-4 events, each on a word of the hook (`("SHAKES"): …`). Events whose words come before 1.6 s play from 1.6 s in the page's order, at least 0.4 s apart; the ink carries the words on time, the board follows. Hook motion never looks like the landing shake (different part, direction or rhythm).
  - **Cause before effect:** anything the hook says happens is caused on screen first, on an earlier word (ep 11: the dog darts out on "Car one", the shake comes on "SHAKES"). Never the effect first and the cause after.
  - **The CAPS word gets its own event, and the motion is the word:** "shakes" is a fast small jitter, not a slow swerve; "fills" is a level rising; "bounces" is up and down; "jumps" is a sudden step. If the drawing would need a different verb, change the drawing, not the voice.
  - **Big enough for a phone:** hook motion moves at least 20 px in the 1080-wide frame (about 2 % of the width; 6 px is invisible on a phone), and the actor is one of the biggest parts on the board, inside the safe area (not the top 15 % or the bottom 20 %).
  - **One place to look:** during the hook only the actor (and its cause) moves or changes; everything else drives, flows or idles evenly in the background, with nothing else lighting up.
  - **Both sides of the "but" in view:** a contrast hook (car one shakes, car five doesn't; one tap, three taps) shows both halves on screen together, side by side, from the landing on; no pan or zoom.
  - **Numbers on screen:** a number in the hook (three taps, under HALF, TEN flushes) is visible as a readout, counter or count of parts by the time it is spoken (or from 1.6 s when it is spoken earlier).
  - **Show the fact, not the reason:** the hook shows the surprising thing the viewer can check (car 5 steady, the tray waiting); the why comes after the series line. A faint ghost of the expected or failing case (at most 1 s) is allowed as a hint.
  - **Ends on the start frame:** by the hook's last word every part is back where the loop's last frame leaves it, so the reel loops there.
  - **No other text:** only the hook note and its underline; no caption.
  - `check-page.py` warns when row 1 has no `Visual hook:`, fewer than 2 cued events, no event on the CAPS word, no "start frame", no hook note on the hook's first words, or no underline on the CAPS word.
- Keep the hook's object name everywhere after it.

## 5. Drawing rules (annotations, 2026-11-01)

- **The rules live in `script-writer/ANNOTATIONS.md`** (what a mark is for, hand-drawn ties, 15+ readability, calm frame, the Annotation column format, the checks). They replace the older note rules here.
- In short: every mark points, groups, counts, names the state or labels a part; every note is tied to its part by an olive arrow, underline or box; at most 6 words (DE and Verilog 4); chip-design 01-07 are the style reference (definitions, rules and worked steps as lines on paper); 1-3 word labels may echo the voice's key word, longer notes never repeat it; DE 01-02 density (a mark every 2-3 s, up to 4 notes on screen, 1.0 s apart, 2.0 s up); a proper-term label on each circuit part; never over a part; nothing during a fold; one `key` mark on the key state.
- **Naming a group (2026-10-27):** when the voice names a group, draw an olive square-cornered box round it on the word, about 12 px clear of every part, with the name just outside. It stays until the voice moves to a new grouping.
- `python script-writer/check-annotations.py page.md` must PASS before the page goes to Notion; `npm run notes:check` must pass on the built reel.

## 6. Timing

- Video time = 3 s entrance + loop time (second pass: 3 + LOOP + loop time).
- Each line plays while its event is on screen or up to 0.5 s before it; never about an event not yet shown or long gone.
- The key-state hold is the longest; the key-state explanation sits on it.
- Planned times use about 3 words per second; after recording they are redone from the real word times.
- **Every event is tied to a spoken word, never to a fixed second (owner, 2026-11-03).** Each On the board event and each mark names the words it lands on: `12.3 ("lamp lights"): the lamp lights`, `NOTE "…" · on "lamp lights" (12.3)`. The seconds are only the plan; after recording, `/htmlmp4` times every event from those words (`annotations.mjs board` and `plan`), so a re-take, a faster read or an extra pause moves the event with its words. An event with no word of its own takes the nearest spoken word before it (`"car five"` + 0.5 s: …). The visual hook too: the hook note writes from 0 s; board events cued before the landing has settled (1.6 s) start at 1.6 s in the page's order, at least 0.4 s apart (section 4). `check-page.py` warns on a board event timed by seconds alone.

## 7. Output format

**DE and Verilog:** (1) the ElevenLabs `text` block; (2) timing table Time | Voiceover | On screen | Draw, in video seconds; (3) ElevenLabs notes, at most 2 lines.

**Chip-design (2026-10-31, replaces the four-section page):** the episode's Notion page holds exactly three things, in this order (copy `example/ep13-decoder.md`):
1. **The ElevenLabs block** at the very top (a ```txt code block, final text), then one line of ElevenLabs notes (model, settings, word count, expected length) and one line on times and notes (planned at about 3 words per second; note check result).
2. **One table, three columns:** `ElevenLabs script | On the board | Annotation`. One row per voice line or short group of lines, in order.
   - **ElevenLabs script:** the row's time range in bold (`**6.1-11.3 s**`), then the exact words of the block, tags included. Read top to bottom, column 1 is the block word for word.
   - **On the board:** what the figure shows at that moment, each event with its time and the word it lands on (`7.4 ("wings A"): plate A pulses`); never a time alone (section 6). The first row also sets up the board (building, parts, labels); the key-state row says what the model computes; fold rows describe the fold; the last row the fold back to the start frame. This column is the brief for the HTML figure.
   - **Annotation:** one mark per line, joined with `<br>`, in the `script-writer/ANNOTATIONS.md` section 5 format (`NOTE "2 x 2 x 2 = 8 flats" · on "wings A" (7.4) · out "Every doorbell" (14.2) · above left · tie arrow to the building`; `PEN ring · on "turns ON" (48.2) · round row 5's lit lamp · out "Each extra" (52.3) · key`). "Nothing new." when nothing is added. `/htmlmp4` builds the reel from these lines and re-times them from the quoted words.
3. **Post caption (2026-11-01)**, at the very end under a `## Caption` heading: one short line (plain English, no emojis, the episode's surprise or takeaway, under about 15 words), then on the next line exactly 5 hashtags picked from this list only, the 5 that fit the episode best: #ai #artificialintelligence #machinelearning #deeplearning #generativeai #aitools #chatgpt #llm #aiagents #futuretech #technology #tech #aichips #aihardware #gpu #nvidia #semiconductors #chipdesign #vlsi #computerarchitecture #npu #edgeai
- No other sections. The detailed script and the 15-year-old questions are worked out in scratch for the checks (section 8) and not put on the page. Global figure rules come from CLAUDE.md.
- After any voice edit, retime the rows from the word-count change and re-run both checkers; a note must never say what the voice says at the same moment.

Order of work: detailed script (scratch), then the page, then recorded voice, then the figure time-scaled to it, then the notes fitted to their frames.

## 8. Checks before publishing (chip-design: record results in the handoff change log)

1. **Facts:** every number, code and claim computed in a scratch script, never by eye; matches CLAUDE.md section 7.
2. **Run `python3 script-writer/check-voice.py <file> --series chip --episode N`** on the block and **`python3 script-writer/check-page.py <page.md>`** on the whole page; both must PASS (the page checker covers column 1 = block, cue words spoken in their row, note limits, folds, Samble characters, end card at 4 s before the end). For each WARN, rewrite the beat or say in the change log why it does not open cold. Then do the counts the script cannot see.
2. **Counts:** word range; no sentence over 15 words; tags, CAPS and `[pause]` limits; right series line and episode number; the sign-off word for word, after a bridge that repeats a hook word.
3. **Read-aloud:** block read with tags removed against section 3 (flow, links, one name per thing).
4. **15-year-old pass:** after every sentence, write the question a curious non-engineer would ask; answer it at that moment (V, D or F), or cut the sentence that raised it. Every term defined on first use; every recipe gets its why.
5. **Sync:** every spoken claim has its F or D at that moment; every F step is in the On the board column in order; every named group has its box.
6. **Quotes:** after any voice edit, re-read every quote on the page against the block; a quote of a cut line is a bug.
7. **Publish:** Status = Script, hook title set in Notion and the CSV, handoff page updated.

9. **Understanding test (2026-11-02, two viewers):** a blind 15-year-old must explain the analogy's "why" in their own words, and a blind first-year BTech student must explain the real circuit in proper terms and match analogy parts to circuit parts, checked by a strict self-check on the storyboard (`/script`, no subagents) and by one blind run on the annotated reel (`/htmlmp4`); see `script-writer/UNDERSTANDING-TEST.md`. This test outranks the rule checks.

## 9. Annotating a recorded episode (mp3 + HTML in, reel out)

Run `/htmlmp4 <series> <N> <mp3>` (`.claude/skills/htmlmp4/`); it does these steps from the Notion page and ends with the sign-off in ANNOTATIONS.md section 6.

1. Transcribe (`npm run notes:transcribe`); check against the page's block; the recording wins for timing; report differences.
2. Sync the figure to the voice (`voice.ts`); each on-screen event lands on its line.
3. Re-anchor each note to its quoted word (up to 0.5 s early), keep its planned length, re-check limits second by second.
4. Place notes on rendered frames (CLAUDE.md section 11, `rules/notes.md`); use each note's exact text; if one cannot fit, report it rather than reword.
5. End card in the last 4 s, export, update the handoff page and `series/reel-builds.csv`.

## 10. Analogies and CSVs

- Use an analogy for flow, timing, storage or noise, where an honest everyday picture folds straight into the circuit; definitions and truth tables stay circuit-only. Reuse a world across episodes (water for transistors and latches, seesaw for SR states, runners for timing). Each analogy part maps to one circuit part, named once at the fold.
- **Real object over a contraption (chip-design, 2026-11-02, from the ep 4 analysis):** prefer an everyday object that really contains the concept (ep 4: a clock really uses BCD, so nothing needs translating) over an invented contraption (17 bucket stairs, 18 two-tap handle). If a metaphor is unavoidable, speak at most 2 mapping pairs at the fold. Carry one visible thing unchanged through the fold (ep 4: the digits 0 7 3 0 move from the clock windows to the bit boxes to the table).
- **Plain numbers (chip-design, 2026-11-02):** no physics formulas (C x V x V, area under I) and no volt or amp values in the voice or the notes. Use small whole-number sums (4+2+1 = 7, 30 / 10 = 3 r 0) and one number contrast that answers the question (5 bits vs 8 bits, 1 cup vs 10 cups). Logic rules such as NOT(L AND R) stay allowed.
- CSV columns: DE and Verilog have Hook title, #, Interview question, (Analogy), Status, Done, Real-world close. Chip-design: Hook title, #, Interview question, Concept, Analogy, Book, Page, Status, Done, Set Tempo, Matched to Tempo.
- Status: Idea, Animation, Script, Recorded, Posted. Keep commas inside fields quoted; never reorder rows or renumber episodes.
