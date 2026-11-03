#!/usr/bin/env python3
"""Check the Annotation column of an episode page against script-writer/ANNOTATIONS.md.

Usage: python script-writer/check-annotations.py PAGE.md [--series chip|de|verilog] [--video SECONDS]

Each Annotation cell holds one mark per line (lines joined with <br>, fields with " · "):
  NOTE "<words>" · on "<spoken>" (<s>) · out <when> · <place> · tie <...> [· tags]
  PEN <shape> · on "<spoken>" (<s>) · <target> · out <when> [· tags]
or "Nothing new." Checks: format, cue words spoken in the row, word limits, ties, no voice repeat,
Samble characters, density (4 on screen, 1.0 s apart, 2.0 s up, a mark every 6 s), folds, end card, one key mark.
ERROR lines fail the check; WARN lines do not.
"""
import argparse, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("page")
ap.add_argument("--series", default="chip", choices=["chip", "de", "verilog"])
ap.add_argument("--video", type=float, help="video length in s (default: last row's end)")
a = ap.parse_args()
sys.stdout.reconfigure(encoding="utf-8")
text = open(a.page, encoding="utf-8").read()
# a page fetched from Notion: <b>A-B s</b> times, escaped [tags]
text = re.sub(r"<b>([\d.]+-[\d.]+ s)</b>", r"**\1**", text).replace("\\[", "[").replace("\\]", "]")
err, warn = [], []
MAXW = 6 if a.series == "chip" else 4
PLACES = {"above left", "above centre", "above right", "below left", "below centre", "below right",
          "outside the box", "top right", "end card"}
SHAPES = {"ring", "box", "arrow", "underline", "wave", "tick", "cross", "glass", "bulb", "squiggle"}
TAGS = {"hook", "badge", "end card", "key"}
try:  # glyphs the Samble font really has ("→" is drawn by the notes kit)
    from fontTools.ttLib import TTFont
    CMAP = set(TTFont("samble/samble.otf").getBestCmap()) | {ord("→"), ord(" ")}
except Exception:
    CMAP = None

rows = []
for line in text.splitlines():
    if not line.startswith("| **"):
        continue
    cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
    t = re.match(r"\*\*([\d.]+)-([\d.]+) s\*\*\s*(.*)", cells[0]) if len(cells) == 3 else None
    if t:
        rows.append((float(t.group(1)), float(t.group(2)), t.group(3), cells[1], cells[2]))
if not rows:
    sys.exit("ERROR no table rows (| **A-B s** ... |)")
end = a.video or rows[-1][1]

words = lambda s: re.findall(r"[a-z0-9']+", re.sub(r"\[[^\]]*\]", "", s).lower())
spoken_all = " ".join(w for r in rows for w in words(r[2]))
folds = [(r[0], r[1]) for r in rows if re.search(r"Now, (the same with bits|let's build it as a circuit)", r[2])]
fb = re.search(r"([\d.]+)-([\d.]+) fold back", rows[-1][3])
if fb:
    folds.append((float(fb.group(1)), float(fb.group(2))))

def when(s, row):
    s = re.sub(r"^out ", "", s.strip())
    if s == "end":
        return end
    m = re.fullmatch(r'(?:fold|"([^"]+)") \(([\d.]+)\)', s)
    if not m:
        err.append(f"{row}: out must be '\"words\" (s)', 'fold (s)' or 'end', got: {s}")
        return None
    if m.group(1) and " ".join(words(m.group(1))) not in spoken_all:
        err.append(f"{row}: out cue \"{m.group(1)}\" is never spoken")
    return float(m.group(2))

marks = []  # (kind, words or shape, in, out, tags, group)
for ri, (r0, r1, voice, board, cell) in enumerate(rows):
    row = f"row {r0} s"
    near = [w for rr in rows[max(ri - 1, 0):ri + 2] for w in words(rr[2])]  # this row and its neighbours
    grams = {tuple(near[i:i + 3]) for i in range(len(near) - 2)}
    for ln in [x.strip() for x in re.split(r"<br\s*/?>|\s+(?=NOTE \"|PEN \w+ · )", cell) if x.strip()]:
        if ln.rstrip(".") == "Nothing new":
            continue
        f = [x.strip() for x in ln.split(" · ")]
        kind = re.match(r'(NOTE) "([^"]+)"$|(PEN) (\w+)$', f[0])
        if not kind or len(f) < 4:
            err.append(f"{row}: not a NOTE or PEN line: {ln[:70]}")
            continue
        m = re.fullmatch(r'on "([^"]+)" \(([\d.]+)\)|at end-4 \(([\d.]+)\)', f[1])
        if not m:
            err.append(f"{row}: second field must be 'on \"words\" (s)' or 'at end-4 (s)': {f[1]}")
            continue
        t_in = float(m.group(2) or m.group(3))
        if m.group(1):
            if " ".join(words(m.group(1))) not in " ".join(words(voice)):
                err.append(f"{row}: cue \"{m.group(1)}\" is not spoken in this row")
            if not (r0 - 0.5 <= t_in <= r1):
                err.append(f"{row}: start {t_in} s is outside the row {r0}-{r1} s")
        rest = f[2:]
        tags = {x for x in rest if x in TAGS}
        grp = next((x[6:] for x in rest if x.startswith("group ")), None)
        if kind.group(1):
            txt = kind.group(2)
            if len(rest) < 3:
                err.append(f"{row}: NOTE needs out, place and tie: {ln[:70]}")
                continue
            t_out, place, tie = when(rest[0], row), rest[1], rest[2]
            if place not in PLACES and not re.fullmatch(r"(left|right) of .+", place):
                err.append(f"{row}: unknown place \"{place}\" for \"{txt}\"")
            if place == "end card":
                tags.add("end card")
            if place == "top right":
                tags.add("badge")
            if not re.fullmatch(r"tie (arrow to .+|underline|box|none)", tie):
                err.append(f"{row}: tie must be 'arrow to PART', 'underline', 'box' or 'none': {tie}")
            if tie == "tie box" and "end card" not in tags and not re.search(r"PEN (box|pbox) · ", cell):
                err.append(f"{row}: note \"{txt}\" is tied to a box, but its row has no PEN box (re-tie it or add the box)")
            # tie none is allowed for worked steps, definitions and rules in free paper (chip-design 01-07 style)
            n = len([w for w in txt.split() if re.search(r"[A-Za-z]", w) and w.lower() != "x"])
            lim = 6 if "end card" in tags else MAXW
            if n > lim and "badge" not in tags:
                err.append(f"{row}: note \"{txt}\" has {n} words, at most {lim}")
            for ch in "×−≈":
                if ch in txt:
                    err.append(f"{row}: note \"{txt}\" uses '{ch}', which Samble lacks (write x, -, about)")
            for ch in sorted({c for c in txt if CMAP and ord(c) not in CMAP}):
                err.append(f"{row}: note \"{txt}\" uses '{ch}' (U+{ord(ch):04X}), which Samble lacks (powers: write 2^20)")
            nw = words(txt)
            rep = [g for g in (tuple(nw[i:i + 3]) for i in range(len(nw) - 2)) if g in grams]
            if rep and "badge" not in tags and n >= 4:  # 1-3 word labels may echo the voice (DE 01-02 style)
                err.append(f"{row}: note \"{txt}\" repeats the voice (\"{' '.join(rep[0])}\")")
            marks.append(("NOTE", txt, t_in, t_out, tags, grp))
        else:
            shape = kind.group(4)
            if shape not in SHAPES:
                err.append(f"{row}: unknown pen shape \"{shape}\"")
            if not re.fullmatch(r'(round|to) .+|under ".+"|beside .+', rest[0]):
                err.append(f"{row}: PEN target must be 'round PART', 'to PART', 'under \"note\"' or 'beside X': {rest[0]}")
            marks.append(("PEN", shape, t_in, when(rest[1], row), tags, grp))

marks = [m for m in marks if m[3] is not None]
notes = [m for m in marks if m[0] == "NOTE"]
for k, w, i, o, tags, g in marks:
    if o <= i:
        err.append(f"{k} \"{w}\" ends ({o} s) before it starts ({i} s)")
    if k == "NOTE" and o - i < 2.0 and o < end:
        err.append(f"note \"{w}\" is up {o - i:.1f} s, needs 2.0 s")
    if "badge" not in tags:
        for f0, f1 in folds:
            if i < f1 and o > f0:
                err.append(f"{k} \"{w}\" ({i}-{o} s) is on screen during the fold {f0}-{f1} s")
starts = sorted((i, g) for k, w, i, o, tags, g in notes)
for (x, gx), (y, gy) in zip(starts, starts[1:]):
    if y - x < 1.0 - 1e-9 and not (gx and gx == gy):
        err.append(f"new notes at {x} s and {y} s are under 1.0 s apart")
for s in range(int(end * 10) + 1):
    x = s / 10
    up = {(g or w) for k, w, i, o, tags, g in notes if i <= x < o and "end card" not in tags}
    if len(up) > 4:
        err.append(f"{len(up)} notes on screen at {x} s: {sorted(up)}")
        break
cards = [m for m in notes if "end card" in m[4]]
if len(cards) != 1:
    err.append(f"needs exactly one end card note, found {len(cards)}")
elif abs(cards[0][2] - (end - 4)) > 0.05:
    err.append(f"end card must start at {end - 4:.1f} s (4 s before the end), not {cards[0][2]}")
keys = [m for m in marks if "key" in m[4]]
if len(keys) != 1:
    err.append(f"needs exactly one key mark (tag key), found {len(keys)}")
if not any("badge" in m[4] for m in notes):
    warn.append("no Episode N badge (place top right)")
if not any(m[0] == "PEN" for m in marks):
    warn.append("no standalone pen marks; rings and boxes make it feel drawn")
ts = sorted(m[2] for m in marks)
for x, y in zip([0.0] + ts, ts + [end - 4]):
    if y - x > 6 and not any(x < f1 and y > f0 for f0, f1 in folds):
        warn.append(f"no new mark from {x} to {y} s ({y - x:.1f} s)")

for e in err:
    print("ERROR", e)
for w in warn:
    print("WARN ", w)
print(f"{'FAIL' if err else 'PASS'}: {len(notes)} notes, {len(marks) - len(notes)} pen marks, {len(folds)} folds, video {end} s")
sys.exit(1 if err else 0)
