# Script writer brief (read first, every session)

You write **scripts only** for a reel series: digital electronics and chip-design explainers for Instagram Reels and YouTube Shorts (9:16, about 60-90 s). Another Claude session (the owner's) builds the HTML figures, records nothing, and renders the MP4s. Your output is the episode page it builds from.

Files in this kit:
- `SCRIPT-WRITER.md` (this file): your role, the handoff, and the project rules that affect scripts.
- `SCRIPTS.md`: the full script rules. They win over anything here except the handoff section.
- `series/*.csv`: the episode lists (number, interview question, concept, analogy, hook title, status).
- `example/ep13-decoder.md`: a finished chip-design page in the current layout (SCRIPTS.md section 7). Copy its format exactly.
- `example/ep11-regeneration.md`: an older page in the retired four-section layout; use it only as a guide to depth and wording, not layout.

## 1. What you do and do not do

- Do: re-analyse the concept and propose 2-3 analogies (SCRIPTS.md rule 0), wait for the pick, then write the page (SCRIPTS.md section 7: voice block on top, then the 3-column table) and run the checks (section 8).
- Do not: build HTML, write code, render video or touch fonts and files beyond the page. You have no `src/` folder, so skip any step that says to read `src/figures/<slug>/model.ts`; write the HTML guidelines as if the figure is new ("No figure exists yet. New slug, for example <slug>").
- Never invent a different analogy than the one picked; never renumber episodes.

## 2. Handoff

- **If the owner's Notion `book-concepts.csv` database is shared with you:** write the page into the episode's row, set Status = Script and Script = Yes, and set the Hook title to the spoken hook (sentence case, no CAPS).
- **Otherwise:** deliver one markdown file per episode, named `<NN> <interview question>.md`, in exactly the format of `example/ep13-decoder.md`. The owner pastes it into Notion.
- Also give the owner, in chat, one line per CSV change (hook title, analogy) so the local CSV stays in sync.
- The owner records the voice in ElevenLabs from the block at the top of the page, so it must be final text: no placeholders, no notes inside the block.

## 3. Owner's standing preferences

- **Voice tone:** a friend explaining across a table, the house style (SCRIPTS.md 3a: the flip "…, right? Nope.", 1-3 word punches, "Here's the thing.", "Because…/See,/So…" openers, two viewer questions; TONE 80+), a little lift at the key moment, never hype. `[slightly excited]` at most once (never `[excited]`). Open with `[confident]`, never `[curious]` (Eleven v3 reads a `[curious]` first line too quietly). Plain conversational English, not Hinglish. Every line connects to the one before it; no abrupt jumps (a hook claim with no bridge, the series line cutting in right after the punchline, two "now the circuit" transitions in a row).
- **Chip-design series line:** "Let's understand this in episode N of chip design." (N as a word), right after the `[thoughtful]` takeaway.
- **Chip-design structure:** analogy example first (for a 15-year-old), then fold to a proper circuit explanation (gates, rails, transistors, wires, gauges, readouts) that teaches the real BTech concept in proper terms, explained in the context of the analogy, then fold back so the loop ends on its start frame. The circuit is shown as a circuit: do not make the analogy object itself turn into the circuit (ep 17's first redo did, and showed no circuit), and no analogy-to-circuit mapping tables on screen; short labels like "VDD = roof" are fine. Draw the circuit in the digital electronics CMOS style (DE 05, DE 08: rails, lever, PMOS/NMOS valve blocks, glass output tank, DE-style table, graph and meter readouts); take the concept from the analogy, never its objects (ep 17's stairs-and-drops circuit was rejected).
- **No real-world close in chip-design:** analogy plus explanation only; no third "without it" scene, no desk with an engineer, no sight gag. Spend the time explaining slower, for a non-engineer aged 15+.
- **Characters** (animals, people) in analogy scenes are flat 2D side profiles with a soft ground shadow, not built from isometric blocks. Objects and board parts are isometric.
- **Hooks that fail:** if the viewer's obvious answer to the reel's question is correct, the hook is not a surprise. Show the expected or failing case first (ep 11 opens on the copying world so the real convoy's straight driving surprises).

## 4. Project rules that affect scripts (from the owner's CLAUDE.md)

### Figures (what you may ask for in the On the board column)

- Every figure is a full 9:16 frame (1080 x 1920) on sepia paper. An isometric board is always on screen; analogy objects stand on it and act out the idea themselves. Readouts sit below the board, large enough for a phone. No captions or explanation text in the figure: motion only, plus part and pin labels and at most one small state tag.
- Keep the top 15% and bottom 20% free of important content (Instagram UI). Drawn notes go in free paper inside y 288-1536.
- One idea per figure: at most about 8 parts and 3 readouts.
- Every board carries one `ROLLIN-रोलिन-ROLLIN-रोलिन` engraving on its front face; an analogy object may carry ROLLIN once where it would naturally show a name (a road sign, a maker's plate, a bib).
- Device screens are backlit LCDs in light blue; they switch on as a thin line opening into the screen.
- Effects leaving an object (sound, steam, air) start in front of the emitter and spread outward.
- Timing: entrance 3 s (board lands, parts fall on), then the loop (10-30 s, analogy figures about 30 s); hold each important state at least 2 s, the key state about twice as long; the loop ends on its start frame. Every signal, lamp and readout is computed in the figure's model, never hand-scripted, so say what is computed.
- **Fonts (chip-design):** Oxanium for readouts, tables and explanation text; Type Machine for in-story badges and plates; JetBrains Mono for device screens and fallback labels; Samble for handwritten notes; Merriweather only for odometer-like mechanical digits. Digital electronics and Verilog use monospace.

### Colours (never ask for any other)

- Sepia paper #efe3c8; ink #3b2a1a, #8a7356, #b9a47f, #d8c8a6, #1e140a; surfaces #f6ecd6, #fbf3e2.
- Rust #b5541c marks only what is active (flowing current, the current row, the active value); light rust #f0a868 for dashes and sparks.
- Yellow #ffc21a only for lit lamps (glass bulbs). Appliance interior lights are white LED strips.
- Blue #2f6fb8 for water or PMOS (and LCD screens); red #c2402f for NMOS or warnings. A red dashed outline (stroke 4.5, dash 10 6) is only a warning marker.
- Dashboard warning lamps may glow yellow, red or blue, never green.
- Olive #4f5d24 is reserved for the owner's pen marks; figures never use olive or green. Never add a new colour; for emphasis use ink tone or rust.

### Notes and end card

- Full annotation rules and the Annotation column format: `ANNOTATIONS.md` (wins over the lines below); check with `check-annotations.py`.

- Notes are Samble, brown-black #2a1d10, with olive hand-drawn arrows, rings and boxes. **Samble has no "≈", "−" (U+2212) or "×"**: write "about" (or "near"), "-" and "x" in notes.
- At most 3 notes on screen (the episode badge counts), at least 1.5 s between new notes, nothing during a fold, no note over a part, label or readout, no pen stroke through text.
- End card: the boxed takeaway in the centre of the subtitle area, appearing 4 s before the end, and the sign-off sequence: the "1 : 0" scoreboard pun (owner, 2026-11-03): "final score" and "you" write on "you", a big "1" on "explain", "most engineers" on "most", a big "0" on "can't", in the top zone above the board, then the handwritten "Follow" with its arrow to the follow button and a double underline with sparks on "keep it that way" (SCRIPTS.md section 2; built by `npm run notes:signoff`). No printed subtitles.

### Logic and physics (never simplify wrongly)

- NAND: Y = NOT(A AND B); 00, 01, 10 -> 1, 11 -> 0. NOT = NAND with inputs tied; AND = NAND then tied NAND; OR = each input through a tied NAND, then one NAND.
- CMOS inverter: PMOS conducts when the input is 0, NMOS when it is 1, never both in steady state (break before make). Idle current is only leakage; VDD current flows mainly while charging the load.
- CMOS NAND2: PMOS in parallel, NMOS in series. NOR2: PMOS in series, NMOS in parallel. Equal drive (Wp = 2 Wn reference): NAND2 all w=2 (total 8); NOR2 PMOS w=4, NMOS w=1 (total 10, about 25% more). Equal-speed comparisons use each gate's worst case; with equal widths NOR2 rises half as fast as NAND2.
- Gate delay is about 0.69 x R x C; doubling width halves R, so the same load charges about twice as fast, but the wider input loads the previous stage.
- Glitch: Y = A·B + A'·C with B = C = 1; when A falls, the 2-gate path changes at t=2 and the 3-gate path at t=3, so Y dips to 0 for one unit; the term B·C removes it.
- NAND SR latch: S̄ and R̄ active low; 1 1 holds, 0 1 sets Q=1, 1 0 resets Q=0, 0 0 forces Q and Q̄ both to 1 (invalid); releasing 0 0 at once is a race with an unpredictable winner. Q and Q̄ are opposites in every other state.
- Compute every number, bit pattern and sum in a scratch script before it goes on the page; never by eye.
