#!/usr/bin/env python3
"""What changed between two versions of an episode page (htmlmp4 step 2).

Usage:
  python3 script-writer/page-diff.py OLD.page.md NEW.page.md
Compares the voice block, every table row (voice, On the board, Annotation) and the caption, and prints one
block per change. Rows are matched by their voice text, so moved times do not count as changes. Every line it
prints is something the figure or the cue file must follow (or the owner is told why not).
Accepts pages saved from Notion (<b>…</b> times, escaped [tags]) and repo copies alike.
"""
import difflib, re, sys


def load(path):
    t = open(path, encoding="utf-8").read()
    t = re.sub(r"<b>([\d.]+-[\d.]+ s)</b>", r"**\1**", t).replace("\\[", "[").replace("\\]", "]")
    t = t.replace("<br />", "<br>")
    block = re.search(r"```txt\n(.*?)```", t, re.S)
    rows = []
    for line in t.splitlines():
        m = re.match(r"\| \*\*[\d.]+-[\d.]+ s\*\* (.*?) \| (.*?) \| (.*?) \|$", line.strip())
        if m:
            rows.append({"voice": m.group(1).strip(), "board": strip_times(m.group(2)), "ann": strip_times(m.group(3))})
    cap = re.search(r"## Caption\s*\n(.*)", t, re.S)
    return (block.group(1).strip() if block else ""), rows, (cap.group(1).strip() if cap else "")


def strip_times(s):
    # planned seconds are not content: 12.3 ("cue") -> ("cue"), (12.3) -> ()
    s = re.sub(r"(?<![\w.])\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)? (?=\(\")", "", s)
    return re.sub(r" \((?:[\d.]+)\)", "", s).strip()


def words(s):
    return re.findall(r"\S+", s)


def show(label, a, b):
    print(f"~ {label}")
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, words(a), words(b)).get_opcodes():
        if op != "equal":
            print(f"    - {' '.join(words(a)[i1:i2])}" if i2 > i1 else "", end="")
            print(("\n" if i2 > i1 else "") + f"    + {' '.join(words(b)[j1:j2])}" if j2 > j1 else "")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    (va, ra, ca), (vb, rb, cb) = load(sys.argv[1]), load(sys.argv[2])
    n = 0
    if va != vb:
        n += 1
        show("voice block", va, vb)
    keys_a = [r["voice"] for r in ra]
    keys_b = [r["voice"] for r in rb]
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, keys_a, keys_b).get_opcodes():
        if op == "equal":
            for a, b in zip(ra[i1:i2], rb[j1:j2]):
                for k, name in (("board", "On the board"), ("ann", "Annotation")):
                    if a[k] != b[k]:
                        n += 1
                        show(f'{name}, row "{b["voice"][:50]}"', a[k], b[k])
        else:
            # changed or new voice lines: everything in those rows is new for the figure
            for a, b in zip(ra[i1:i2], rb[j1:j2]):
                n += 1
                show(f'row voice "{b["voice"][:50]}"', a["voice"], b["voice"])
                for k, name in (("board", "On the board"), ("ann", "Annotation")):
                    if a[k] != b[k]:
                        show(f"  {name}", a[k], b[k])
            for b in rb[j1 + (i2 - i1):j2]:
                n += 1
                print(f'+ new row "{b["voice"][:60]}"\n    board: {b["board"]}\n    annotation: {b["ann"]}')
            for a in ra[i1 + (j2 - j1):i2]:
                n += 1
                print(f'- removed row "{a["voice"][:60]}"')
    if ca != cb:
        n += 1
        show("caption", ca, cb)
    print(f"{n} change(s)" if n else "no changes: the figure and the cue file already follow this page")


if __name__ == "__main__":
    main()
