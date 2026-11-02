# Notes overlay and reel export

This folder turns a voice-synced figure page into a finished reel. It adds handwritten notes, olive pen marks (arrows, rings, ticks, doodles), optional subtitles and the Rollin engraving on the board edge. Then it exports an uploadable MP4 on the sepia paper.

Episode 01 is the reference build: `episodes/01.mjs`, exported as `shorts/digital-electronics/01 Why do computers use binary/Why do computers use binary (reel).mp4`.

The source figure page is never edited. Every notes page is a new file that is regenerated from its cue file, so you can always rebuild or revert by running one command.

---

## 1. Quick start: a new episode

Episode NN needs `shorts/digital-electronics/NN <question>/` with a voice-synced page (video t = audio t) and `<N>.mp3`. The steps below use episode 02 as the example.

1. **Transcribe** the voiceover (about 1 minute, offline):
   ```bash
   npm run notes:transcribe -- "shorts/digital-electronics/02 How does a transistor work as a switch/2.mp3" builds/notes/episodes/02.words.json
   ```
   It prints phrases with start-end times. Those times are your cue times.
2. **Look at the figure** at the moments you want to annotate (one image, no video):
   ```bash
   npm run notes:sheet -- "shorts/digital-electronics/02 How does a transistor work as a switch/How does a transistor work as a switch (water tap, voice).html" 4 10 16 22 30 --cols 5
   ```
   The sheet opens at `builds/notes/.check/sheet.png`; each cell is labelled with its second. Read positions off it (section 4).
3. **Write the cue**: copy `episodes/01.mjs` to `episodes/02.mjs`, then change `DIR`, `SOURCE`, the wipe times and the notes and pen lists (section 3). Keep one variant to start with.
4. **Build** the notes page:
   ```bash
   npm run notes -- 02
   ```
5. **Place, then check overlaps automatically.** `node builds/notes/autoplace.mjs builds/notes/episodes/02.mjs --write` first moves the marks that would fail (table in section 2). Then the check (required; export runs it too and refuses to export while it fails):
   ```bash
   npm run notes:check -- "shorts/digital-electronics/02 …/… (water tap, voice, notes).html"
   ```
   Fix every line it prints, then rebuild. Then look at the placement at the cue times (repeat steps 3-5 until it reads well):
   ```bash
   npm run notes:sheet -- "shorts/digital-electronics/02 …/… (water tap, voice, notes).html" 5 12 20 31 45
   ```
6. **Export** the reel (renders about 2-3 minutes, then encodes):
   ```bash
   npm run notes:export -- "shorts/digital-electronics/02 …/… (water tap, voice, notes).html"
   ```
   This writes `shorts/digital-electronics/02 …/How does a transistor work as a switch (reel).mp4`.
7. **Log it**: update the episode's row in `series/reel-builds.csv` (section 10).

---

## 2. Files

| Path | What it is |
|---|---|
| `builds/notes/notes-kit.mjs` | The builder: `buildNotes(variant)` writes one notes page. It holds the CSS, the handwriting animation, the subtitles and the engraving script. |
| `builds/notes/pen.mjs` | Pen shape helpers (`arrow`, `ring`, `tick`, `wave`, `squiggle`, `bulb`, `box`, `both`, `cross`, `line`), each returning SVG path data. |
| `builds/notes/build-notes.mjs` | CLI: `npm run notes -- <NN> [variant]`. |
| `builds/notes/episodes/<NN>.mjs` | The cue file for one episode: an array of variants (one page each). |
| `builds/notes/episodes/<NN>.words.json` | Word timings from the transcript: `[[start, end, word], …]`. |
| `builds/notes/transcribe.py` | Whisper transcription (faster-whisper, `small.en`). |
| `builds/notes/check.mjs` | Overlap checker. It plays the page every 0.1 s in headless Chrome and fails on any overlap (rules R1-R6, section 7). `export-reel.mjs` runs it first. |
| `builds/notes/sheet.mjs` | Contact sheet of chosen seconds, rendered from a copy of the page. |
| `builds/notes/autoplace.mjs` | `node builds/notes/autoplace.mjs <cue.mjs> [--write]`: measures labels, parts, notes and pens every 0.1 s and moves only the notes (with their group) and tie arrows that would fail R1-R6, keeping each note on its planned side of its part; tips end 15 px clear of parts (never pulled more than 45 px). Prints the moves, `NO FIT`, `FIXED` (badge, end card) and `LINES` (overlapping lines of one group) for hand fixes. Run `notes:check` after it. |
| `builds/notes/annotations.mjs` | `plan <page.md> <words.json>` resolves every planned mark of the page's Annotation column against the transcript; `signoff <page.md> <words.json> <cue.mjs>` checks the cue file builds them as planned (`/htmlmp4` steps 6-7). |
| `builds/notes/spell.mjs` | Shared spelling for matching page words against Whisper: number words fold to digits ("fifty-eight" = "58", "a hundred and three" = "103"), "P" + "moss" = "P-moss", "tri" + "-state" = "tri-state", "VDD" = "V D D". |
| `builds/notes/retake.mjs` | `npm run notes:retake -- <NN.old.words.json> <NN.words.json> [--write <slug>]`: after a re-recorded voice, aligns the old and new transcripts word by word and prints (or, with `--write`, writes) the voice page that maps the new take onto the figure's existing timeline, plus the spans spoken in only one take. |
| `builds/notes/episodes/<dir>/NN.old.words.json` | The previous take's transcript, kept for `notes:retake` (chip-design 11-18). |
| `builds/notes/probe.mjs` | Evaluates a JS expression in a page at a given second (for measuring parts, boards and readouts). |
| `builds/notes/notion-notes.mjs` | Prints the "On-screen notes" section for an episode's Notion page, from its cue file. |
| `builds/notes/export-reel.mjs` | Alpha render, then paper + audio, then MP4. |
| `builds/notes/.check/` | Scratch output of `sheet.mjs` (safe to delete). |
| `.tools/whisper/` | Python 3.13 venv with faster-whisper (about 290 MB; the model is cached in `~/.cache/huggingface`). |
| `samble/samble.otf` | The handwriting font. Pages load it by absolute file URL. |
| `shorts/backdrops/Sepia paper.png` | The 1080x1920 paper the reel sits on. |
| `series/reel-builds.csv` | Build database, one row per episode (section 10). |

Outputs in `shorts/digital-electronics/NN …/`:

| File | Meaning |
|---|---|
| `<question> (<analogy>, voice).html` | The voice-synced source page. Never edited. |
| `<question> (<analogy>, voice, notes…).html` | The generated notes page. |
| `<same name>.mov` | Its transparent ProRes 4444 render (for Premiere). |
| `<question> (reel).mp4` | The upload file. |

---

## 3. Cue file reference

A cue file default-exports an array of **variants**. Each variant becomes one page:

```js
{
  name: "notes-2",                       // used by: npm run notes -- 01 notes-2
  source: DIR + "… (bulb meter, voice).html",
  out: DIR + "… (bulb meter, voice, notes 2).html",
  words: "builds/notes/episodes/01.words.json",  // only needed for subtitles
  subtitles: null | "auto" | [[start, end, "text"], …],
  crowd: { max: 3, gap: 1.5 } | false,   // crowding limits for the checker (default as shown)
  notes: [[x, y, size, start, duration, wipe, "text"], …],
  pen: [{ t, d, w, p }, …],
  engrave: { … } | null,
  patches: [[from, to, "why"], …],      // exact text edits of the source bundle
}
```

### Notes (handwriting, Samble font, brown-black `#2a1d10`)

`[x, y, size, start, duration, wipe, text, opts?]`

- **`opts`** (optional):
  - `{ grow: 1.2 }` scales the note up from 55 % over 1.2 s while it writes.
  - `{ alive: true }` keeps each letter wobbling slightly after it inks (fixed per-letter offsets, so every render is identical).
  - Both are used for the end card's next-episode note.
- **`x, y`:** the centre of the text in frame px.
- **`size`:** font size in frame px. Hook 72-84; notes on arrows 42-46; lines below the board 44-48; small sketch labels 40.
- **`start`:** when the first letter starts inking, in video seconds. Use the spoken word's time from the transcript plus 0 to 0.3 s.
- **`duration`:** how long the whole word takes to write. About 0.045 s per letter, between 0.25 and 1.4 s.
- **`wipe`:** when the note fades out (0.45 s fade, drifting up 14 px). Use the variant's fold times, or `END` (999) to keep it to the end.

Letters ink in one by one (fade, rise, slight rotation), so it reads like writing.

### Pen marks (olive `#4f5d24`, 4 px, round caps)

`{ t, d, w, p }`: start, draw duration, wipe, and path data from `pen.mjs` (or a raw `"M… L…"` string). The stroke draws on from start to end with an ease.

| Helper | Use | Notes |
|---|---|---|
| `arrow(x1,y1,x2,y2,bend)` | Points from a note to a part | Curved; `bend` in px (+ bows left of travel, − right). Start beside the note; stop 5-10 px short of the part. Open V head. |
| `ring(cx,cy,rx,ry,tilt=15)` | Circles a part | Smooth ellipse tilted with the board, closing with a small overlap. Draw only after the part has settled (never mid-fold). |
| `tick(x,y,s)` | Ticks a pattern or a steady part | `s` scales it (1.3 for a stronger tick). |
| `cross(x,y,r)` | Marks something wrong | Use sparingly. |
| `wave(x0,x1,y,a,n)` | Wavy underline under a key word | Put it 50-60 % of the font size below the text centre. |
| `squiggle(x0,x1,y,a,n)` | Noise doodle | Under a "noise" note, or running toward a gap. |
| `bulb(x,y)` | Light-bulb doodle | Beside the hook (light analogies). |
| `glass(x,y)` | Glass-of-water doodle | Beside the hook in water analogies. Always a glass of water, never a drop. |
| `box(x0,y0,x1,y1)` | Box around a sketch or an end card | Corners cross slightly. |
| `both(x1,y1,x2,y2)` | Dimension arrow ("wide gap") | Two heads. |
| `line(x0,y0,x1,y1,sag)` | Hand-drawn level line | Slightly bowed. |

### Subtitles (optional)

- **`null`:** no printed subtitles. The 01 reel uses this; its notes carry the meaning.
- **`"auto"`:** lines are built from `words.json`. A line breaks at `. ? ! :`, at a comma after 3 or more words, at a pause over 0.35 s, or at 6 words.
- **A list:** `[start, end, "text"]`. Word darkening uses the transcript times when the word count matches.

The style is three-tone, in the board monospace (600 weight, 42 px), centred at y = 1440. Coming words are faint `#e3d6bb`, the spoken word is `#2a1d10` and past words are mid `#8a7356`. Each line fades in over 0.25 s and out over 0.2 s.

### Engraving (the Rollin signature)

```js
engrave: { words: ["ROLLIN", "रोलिन"], repeat: 2, sep: "-",
           x0: 130, x1: 820, topAt: [500, 1048], slope: 0.267, face: 43, size: 15, tone: "mid" }
```

- **Text:** `ROLLIN-रोलिन-ROLLIN-रोलिन`, centred between `x0` and `x1` on the board's front face.
- **Style:** the kit label style (`iso-face-text`, `mid` tone, bold mono caps, a pale 0.8 px lip under each letter). Devanagari falls back to Nirmala UI.
- **Entrance:** it is placed inside the board group `[data-base]`, so it rises and lands with the board.
- **Geometry:** `topAt` is one point on the face's top edge in frame px, `slope` is its rise per px (0.267 at azimuth 62), and `face` is the face height in px. Measure all three on a rendered frame (section 4).

**Every board carries the engraving.** Every notes page of every episode gets `engrave`. If the figure already engraves it in its own source (new figures do, CLAUDE.md section 5), set `engrave: null` so it is not doubled. Exactly one engraving, on the board's front face (or the largest grounded part when there is no board); never on readouts. An analogy may add one in-story "ROLLIN" (caller ID, maker's plate, runner's bib) inside the figure itself. For a new board:
1. Measure its front face (section 4).
2. If the face is under about 35 px tall, add a slab patch (below) and measure again.
3. Keep arrows clear of the text; the checker (R5) enforces this.

### Patches (board slab)

Exact-text replacements in the minified source bundle. Each must match exactly once, or the build stops.

Ep 01 thickens the board from 5 to 9 units, grown downward so every part keeps its place, which gives the engraving a 43 px face. To find the slab in another page, search the page for `board:Ft(`, which looks like `halo:Td(Or,-5,5,H),board:Ft(Or,-5,5,H,5,.8)`. Change the two `-5,5` pairs to `-9,9`, and re-measure the face afterwards (the bottom edge moves down by about 18 px).

---

## 4. Frame layout and finding positions

The frame is 1080 x 1920 px. Every note and pen coordinate is in these units, whatever the render scale.

| Zone | y range | Use |
|---|---|---|
| Instagram top UI | 0-288 | Nothing important. "Episode N" sits at y ≈ 330, top right. |
| Above the board | 300-760 | Hook (y ≈ 430), sketches (noise margin 430-680), notes over tall parts. |
| Board band | ≈ 780-1190 | Only pointers on the board itself (arrows, ticks, rings), never words over parts. |
| Below the board | 1200-1500 | Pattern rows, "supply → switch", the interview answer block, end card. |
| Instagram bottom UI | 1536-1920 | Nothing. |

**To find a part's position:** run `notes:sheet` at a second when the part is on screen and settled. Each cell is the full frame scaled by `--scale` (default 0.5), so multiply what you read by 1/scale. For finer work, use `--scale 1 --crop 760:500`, which keeps frame rows 760-1260 at full size.

**To measure the board's front face** for the engraving: render a frame at scale 1 (`capture.mjs --frames` on a copy), then print a column of pixels and look for the dark outline rows. This is how `topAt`, `slope` and `face` were found for 01:

```bash
ffmpeg -v error -i frame.png -vf "crop=1:260:500:930,format=gray" -f rawvideo - | od -An -tu1 -w260 -v
```

Do this at two x positions; the slope is Δy/Δx.

**Ep 01 reference positions** (bulb-meter board, 9-unit slab), useful as a starting guess for similar boards:

| Part | Frame px |
|---|---|
| Supply block, NOISE block (label) | (240, 905), (316, 932) (label 300, 962) |
| Left bulb, left meter top, left needle | (455, 880), (528, 770), (512, 866) |
| Right bulb, right meter top, right needle | (635, 975), (700, 858), (712, 940) |
| Switch blocks, lever knobs (circuit) | (240, 916), (300, 860); (256, 830), (320, 774) |
| Truth table | x 670-940, y 955-1110 |
| Board front face | top y = 1048 + 0.267 (x − 500), 43 px tall, x 130-820 |

**Ep 02** (water-tap board, no slab patch): front face top y = 1052 + 0.265 (x − 400), 39 px tall, usable x 120-730.

---

## 5. Timing rules

- **Clock:** on voice pages, video t = audio t. The entrance (board lands) runs 0-3 s; the figure's own events are in its built page.
- **Note start:** about 0.2 s after the spoken word (transcript time). Never before it is said, and never after the thing is gone.
- **Cue rate:** about 1 cue every 4-8 s, and no new notes during a fold.
- **Folds wipe notes:** give every note in a phase the same `wipe` (the fold start, e.g. 22.9, 36.2, 49.6 in 01). Pen marks of that phase use the same value.
- **No overlaps:**
  - A note that reuses a spot must start at least 0.5 s after the old note's `wipe`, because the fade takes 0.45 s.
  - Doodles and ticks keep about 20 px clear of their words.
  - Arrow tips stop 10-15 px short of parts and never land on engraved labels (NMOS, TAP, VDD).
  - Check a sheet at every cue second plus every wipe second before exporting.
- **Pen marks** are checked on a frame at their own second. Rings only after the fold has settled (01's circuit settles at about 53 s).
- **At most 2-3 notes appear together**, and a note never repeats the voiceover word for word, with one exception: the **real-world close** ("without it": what the viewer's world would cost or break without the concept; SCRIPTS.md section 3) is written out in full below the board, one line per spoken line, and stays until the end card needs the space. It replaces the old interview answer block.
- **End card (every video):**
  - The takeaway (2-4 words, e.g. "2 levels = safe") is written boxed in the centre of the subtitle area (x 540, y ≈ 1408; box 360-720 x 1372-1444).
  - "Episode N+1 →" sits at the very bottom (x 540, y ≈ 1693, about 1 cm on a phone below the takeaway area) with `{ alive: true }`. It writes in 4 s before the video ends and stays at a fixed size; its strokes line-boil (noise displacement, style 1 of `testers/episode-card-wiggle.html`). It does not grow.
  - Alternatives are in `testers/episode-card-styles.html`.
  - Clear anything in that area first (01 wipes the interview answer at 52.6).

---

## 6. Style rules

- **Words:** Samble, `#2a1d10`, sentence case or lowercase as spoken; `→` for "becomes".
- **Pen:** olive `#4f5d24`, 4 px. Doodles are welcome (bulb, squiggles, wavy underlines, boxes) because they make it feel hand made. Water analogies get a glass of water (`glass`), never a drop.
- **Not used:** rust, yellow, blue or red in notes (they mean current, lit bulbs, PMOS/water and NMOS/warnings), and no notes over parts.
- **Engraving:** small and quiet (15 px, mid tone). It is a signature, not a headline.
- **Truth tables:** paper card (style 2 of `testers/truth-table-styles.html`): face #f6ecd6, 1.8 px ink outline, small radius, muted headers over a thin faint rule, plain ink rows, current row on the lit shade #ecdcbc in strong ink with only its output in rust. Pages whose tables differ get the restyle as a cue `css` block (see `episodes/03.mjs`, `TABLES`).
- **Clutter check:** if a frame shows more than about 6 marks plus notes, cut doodles or merge notes.

---

## 7. Checking: the overlap rules (enforced)

`npm run notes:check -- "<page>"` plays the page on the capture clock, every 0.1 s from 0 to the end. It measures what is actually visible (anything 15 % visible or more, so a fading note still counts) and fails on:

| Rule | Fails when |
|---|---|
| R1 | Two visible notes overlap (3 px margin). Stacked lines of one group may touch; they fail only when they overlap by more than 6 px. (Fixed 2026-11-02: before that, R1 never fired, so cues checked earlier may hide overlaps.) |
| R2 | A pen stroke runs through a visible note. Arrows must start beside their note; underlines sit below it. |
| R3 | A note covers an engraved board label (NMOS, TAP, VDD, NOISE, meter digits, the engraving). |
| R4 | A note covers a visible part (anything except the board slab and the long rails). |
| R5 | A pen stroke runs through an engraved label. |
| R6 | An arrow tip lands on a visible part. Tips stop short. |
| R7 | More than 3 notes are on screen at once. A group (`{ group: "interview" }`) counts once; the "Episode N" tag and the end-card note do not count. |
| R8 | A note starts writing less than 1.5 s after the previous one (lines of the same group are exempt). |

R7 and R8 keep a frame calm. A cue can change the limits with `crowd: { max, gap }`, or opt out with `crowd: false`; 01 and 02 opted out because they were approved before these rules. A full frame (several boards, big readouts, as in 03) needs fewer notes, not smaller ones: one short note per board per phase.

R4 and R6 start at 1.6 s, once the parts have landed. Output lists each hit with its time span and the note text or the start of the pen path, so it maps straight back to the cue file. `notes:export` runs the check first and stops without rendering if anything is listed, so an overlapping reel cannot be exported. Never bypass it; move the note or the mark instead.

The check cannot judge taste (crowding, a pointer to the wrong part), so still look at a sheet.

### Looking without spending effort

- `notes:sheet` renders a **copy** of the page, so no stray `.mov` ever lands in `shorts/`. Never point `capture.mjs` at a notes page with `--frames` unless you want a `.mov` written next to it.
- Check only the seconds you changed.
- `--crop` keeps sheets small, which makes them faster to read and cheaper to send to Claude.

---

## 8. Export details

`export-reel.mjs`:

1. Runs `capture.mjs <page> --transparent --scale 1 --fps 30 --force`, which writes `<page>.mov`. The length is the 3 s entrance plus the page's `iso-loop` meta value; for 01 that is 55.5 s.
2. Lays the render over `Sepia paper.png`, adds `<N>.mp3`, and pads the audio with silence to the video length.
3. Encodes H.264 High (yuv420p, CRF 17, preset slow), AAC 192k 48 kHz, with `+faststart`, at 1080x1920, 30 fps. 01 came out at 8.6 MB.

Use `--skip-render` to re-encode from an existing `.mov`, `--audio` for another voice take, and `--paper` for another background.

---

## 9. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Notes show in a fallback script font | The page could not load Samble. Pages use the absolute file URL of `D:/Anatomy/samble/samble.otf`; if the project moved, rebuild the page with `npm run notes -- NN`. |
| `patch not found (board slab …)` | The source page differs from the one the cue was written for. Search the page for `board:Ft(` and update the patch. |
| Engraving floats off the edge | The slab or camera differs. Re-measure `topAt`, `slope` and `face` (section 4). |
| `open() got an unexpected keyword argument 'metadata_errors'` | PyAV mismatch; `transcribe.py` already decodes with ffmpeg, so this only appears if you call `faster_whisper` on a file path directly. |
| ffmpeg `Fontconfig error` and a crash in `drawtext` | Windows ffmpeg has no font config; `sheet.mjs` passes `consola.ttf` explicitly. |
| A ring looks lopsided or circles the wrong part | It was placed using another phase's frame. Re-check at its own second, after the fold. |

---

## 10. Build database: `series/reel-builds.csv`

There is one row per episode, ready for Notion import like the other CSVs in `series/`. Columns:

| Column | Meaning |
|---|---|
| Episode | NN |
| Interview question | The folder name without NN |
| Audio | The voiceover file in the episode folder |
| Voice page | The synced source page (or how it is synced) |
| Transcript | The `words.json` path, once transcribed |
| Cue file | `builds/notes/episodes/NN.mjs`, once written |
| Reel page | The notes page that is exported |
| Reel MP4 | The upload file |
| Subtitles | none / auto / list |
| Engraving | The text, or none |
| Status | no audio, audio only, voice page ready, cues in progress, reel exported, posted |
| Updated | Date of the last change (YYYY-MM-DD) |
| Notes | Anything odd |

Update the row whenever a stage finishes. Claude does this as part of every export.

---

## 11. Asking Claude for a new episode (cheap and quick)

Send one message like this:

> Make the notes reel for episode 02 following `builds/notes/README.md`. Voice page: `… (water tap, voice).html`. No subtitles, interview answer in full, engraving as 01. No checks except one sheet at the end.

Claude then needs to read only this README, the 01 cue file, the new transcript and one or two sheets.
