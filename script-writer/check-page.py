#!/usr/bin/env python3
"""Check a chip-design episode page (SCRIPTS.md section 7 layout).

Usage: python3 script-writer/check-page.py PAGE.md [--video SECONDS]
PAGE.md: the page as markdown (the ```txt voice block, then the 3-column table).

Checks:
- column 1 of the table, read top to bottom (time prefix removed), is exactly the voice block;
- every row's time range is in order and does not overlap the next;
- annotation notes ("In X s ..., out Y s" / "to the end"): at most 3 on screen, at least
  1.5 s between new notes, each up at least 2.5 s, none during a fold, no Samble-missing
  characters (× − ≈), the end card starts 4 s before the end;
- every quoted cue word in columns 2 and 3 ("on \"...\"", 12.3 (\"...\")) is spoken in that row;
- WARN: row 1 breaks the visual hook rules (SCRIPTS.md section 4): no "Visual hook:", fewer than 2 cued events,
  no event on the hook's CAPS word, no "start frame", no hook note on the hook's first words (the cold open), or
  no underline on the CAPS word;
- WARN: an On the board event timed by seconds alone ("16.0: the lamp lights") instead of by its spoken words
  ("16.0 (\"lamp lights\"): the lamp lights"); seconds alone cannot follow the recording (SCRIPTS.md section 6).
"""
import argparse, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("page")
ap.add_argument("--video", type=float, help="video length in s (default: last row's end)")
a = ap.parse_args()
text = open(a.page, encoding="utf-8").read()
# a page fetched from Notion: <b>A-B s</b> times, escaped [tags]
text = re.sub(r"<b>([\d.]+-[\d.]+ s)</b>", r"**\1**", text).replace("\\[", "[").replace("\\]", "]")
err = []
warn = []

m = re.search(r"```txt\n(.*?)```", text, re.S)
if not m:
    sys.exit("ERROR no ```txt voice block at the top")
block = m.group(1)
rows = []
for line in text.splitlines():
    if not line.startswith("| **"):
        continue
    cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
    if len(cells) != 3:
        err.append(f"row does not have 3 columns: {line[:60]}")
        continue
    t = re.match(r"\*\*([\d.]+)-([\d.]+) s\*\*\s*(.*)", cells[0])
    if not t:
        err.append(f"column 1 must start with **A-B s**: {cells[0][:60]}")
        continue
    rows.append((float(t.group(1)), float(t.group(2)), t.group(3), cells[1], cells[2]))

norm = lambda s: " ".join(s.split())
if norm(" ".join(r[2] for r in rows)) != norm(block):
    err.append("column 1 read top to bottom is not exactly the voice block")
for r, n in zip(rows, rows[1:]):
    if not r[0] < r[1] <= n[0]:
        err.append(f"times out of order or overlapping: {r[0]}-{r[1]} then {n[0]}")
end = a.video or (rows[-1][1] if rows else 0)

# Folds: rows whose voice is the fold line, and the fold back in the last row
folds = [(r[0], r[1]) for r in rows if re.search(r"Now, (the same with bits|let's build it as a circuit)", r[2])]
fb = re.search(r"([\d.]+)-([\d.]+) fold back", rows[-1][3]) if rows else None
if fb:
    folds.append((float(fb.group(1)), float(fb.group(2))))

notes = []
for r in rows:
    for mm in re.finditer(r"In ([\d.]+) s[^.]*?(?:, out ([\d.]+) s|, to the end)[^\"]*\"([^\"]+)\"", r[4]):
        i = float(mm.group(1)); o = float(mm.group(2)) if mm.group(2) else end
        notes.append((mm.group(3), i, o))
    # cue words must be spoken in this row
    spoken = norm(re.sub(r"\[[^\]]*\]", "", r[2])).lower()
    for bare in re.findall(r"(?<![\w.(\-])(\d+\.\d(?:-\d+\.\d)?): ", r[3]):
        warn.append(f"row {r[0]} s: board event at \"{bare}:\" has no spoken cue; write it as {bare} (\"words it lands on\"): …")
    for q in re.findall(r"(?:on |\d \()\"([^\"]+)\"", r[3] + " " + r[4]):
        if norm(q).lower() not in spoken:
            err.append(f"cue \"{q}\" at {r[0]} s is not spoken in that row")

ins = sorted(n[1] for n in notes)
for x, y in zip(ins, ins[1:]):
    if 0 < y - x < 1.5 - 1e-9:
        err.append(f"new notes {x} s and {y} s are under 1.5 s apart")
for t, i, o in notes:
    if o - i < 2.5:
        err.append(f"note \"{t}\" is up {o - i:.1f} s, needs 2.5 s")
    for ch in "×−≈":
        if ch in t:
            err.append(f"note \"{t}\" uses '{ch}', which Samble lacks (write x, -, about)")
    if not t.startswith("Episode") or t == "Episode 14 →":
        for f0, f1 in folds:
            if i < f1 and o > f0 and not (i >= f1 or o <= f0):
                err.append(f"note \"{t}\" ({i}-{o} s) is on screen during the fold {f0}-{f1} s")
for k in range(int(end * 10) + 1):
    x = k / 10
    up = {t for t, i, o in notes if i <= x < o}
    if len(up) > 3:
        err.append(f"{len(up)} notes on screen at {x} s: {sorted(up)}")
        break
if notes and "end card" in text and not re.search(rf"In {end - 4:.1f} s \(4 s before the end\)", text):
    err.append(f"end card must come in at {end - 4:.1f} s (4 s before the end)")

# Visual hook (SCRIPTS.md section 4)
if rows:
    b1 = rows[0][3]
    vh = b1.split("Visual hook", 1)
    if len(vh) < 2:
        warn.append("row 1: no \"Visual hook:\" (2-4 events on the hook's words, SCRIPTS.md section 4)")
    else:
        cues = re.findall(r"\d \(\"([^\"]+)\"", vh[1])
        if len(cues) < 2:
            warn.append(f"row 1: visual hook has {len(cues)} cued event(s), needs 2-4")
        caps = re.findall(r"\b[A-Z]{2,}\b", re.sub(r"\[[^\]]*\]", "", rows[0][2]))
        if caps and not any(caps[0] in c for c in cues):
            warn.append(f"row 1: no visual hook event on the CAPS word \"{caps[0]}\"")
        if "start frame" not in b1:
            warn.append("row 1: the visual hook does not say where it ends (\"the start frame\")")
    a1 = rows[0][4]
    first = norm(re.sub(r"\[[^\]]*\]", "", rows[0][2])).split()
    hook_note = re.search(r'NOTE "[^"]+" · on "([^"]+)"[^<]*· hook', a1)
    if not hook_note:
        warn.append("row 1: no hook note (NOTE … · hook) to write from frame 0")
    elif first and hook_note.group(1).split()[0].lower() != first[0].lower().strip(",."):
        warn.append(f"row 1: the hook note is cued on \"{hook_note.group(1)}\", not the hook's first words: it must write from frame 0")
    caps1 = re.findall(r"\b[A-Z]{2,}\b", " ".join(first))
    if caps1 and not re.search(rf'PEN underline · on "[^"]*{caps1[0]}[^"]*"', a1):
        warn.append(f"row 1: no olive underline on the CAPS word \"{caps1[0]}\" (PEN underline · on \"…{caps1[0]}…\" · under \"<word of the hook note>\")")

for e in err:
    print("ERROR", e)
for w in warn:
    print("WARN ", w)
print(f"{'FAIL' if err else 'PASS'}: {len(rows)} rows, {len(notes)} notes, {len(folds)} folds, video {end} s")
sys.exit(1 if err else 0)
