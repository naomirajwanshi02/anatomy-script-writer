#!/usr/bin/env python3
"""Check an episode's ElevenLabs block (and, for a full page, its voice quotes)
against the countable rules in script-writer/SCRIPTS.md.

Usage:
  python3 tools/check_voice.py --series chip --episode 13 "scripts/13 What does a decoder do in a memory chip.md"
  python3 tools/check_voice.py --series de --episode 4 block.txt

The file is either a full episode page (the block is taken from the first
```txt fence; voice quotes in sections 3 and 4 are then checked against it) or
a plain text file holding only the block. Exit code 0 = PASS, 1 = FAIL.

It cannot judge meaning. After it passes, still do the written cold-viewer pass
(SCRIPTS.md section 8, check 4) and log it on the page.
"""
import argparse
import re
import sys

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_word(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else "-" + ONES[n % 10])
    if n < 1000:
        rest = n % 100
        return ONES[n // 100] + " hundred" + ("" if rest == 0 else " and " + num_word(rest))
    raise ValueError(n)


TAG = re.compile(r"\[([^\]]+)\]")
CUE_TAGS = {"pause", "pause, then normally"}
LINK_WORDS = {"so", "but", "now", "watch"}
ALLOWED_CAPS = {"NAND", "NOR", "AND", "OR", "NOT", "XOR", "XNOR", "CMOS", "NMOS", "PMOS",
                "VDD", "RTL", "ROLLIN", "RAM", "ROM", "CPU", "LED", "MP3", "USB", "OK", "TV"}
FILLER = ["basically", "so yeah", "let's dive in", "lets dive in", "in this video", "in today's video"]
CROSS_REF = [r"\bfrom episode\b", r"\blike episode\b", r"\bin episode\b(?! \w+ of)", r"\bremember\b", r"\blast episode\b"]
RAW_SYMBOLS = "≈×−→←↑↓≥≤·̄=+^/<>%&*#@"
STOP = set("""a an the and or but so now how why what who when where which is are was were be been
this that these those it its it's of to in on at for with by from as if then than just only
one two three four five six seven eight nine ten let's lets watch let us we you your our
can could does do did will would has have had not no yes all each every""".split())


def strip_tags(s):
    return re.sub(r"\s+", " ", TAG.sub("", s)).strip()


def words(s):
    return strip_tags(s).split()


def sentences(s):
    text = strip_tags(s)
    return [x.strip() for x in re.split(r"(?<=[.?!])\s+", text) if x.strip()]


def content_words(s):
    return {w for w in re.findall(r"[a-z]+", strip_tags(s).lower()) if len(w) >= 4 and w not in STOP}


def norm(s):
    s = strip_tags(s).lower()
    s = s.replace("’", "'").replace("…", "...")
    s = re.sub(r"\.\.\.$", "", s.strip())
    return re.sub(r"[^a-z0-9' ]+", " ", s).split()


def extract_block(text):
    m = re.search(r"```txt\n(.*?)```", text, re.S)
    return (m.group(1) if m else text).strip(), bool(m)


def check(block, series, episode):
    errors, notes = [], []
    beats = [b.strip() for b in re.split(r"\n\s*\n", block) if b.strip()]
    all_words = words(block)
    n = len(all_words)
    lo, hi = (170, 200) if series == "chip" else (180, 210)
    notes.append(f"words (tags removed): {n} (allowed {lo}-{hi})")
    if not lo <= n <= hi:
        errors.append(f"word count {n} is outside {lo}-{hi}")

    for s in sentences(block):
        k = len(s.split())
        if k > 15:
            errors.append(f"sentence has {k} words (max 15): \"{s}\"")

    tags = [t.strip() for t in TAG.findall(block)]
    if not block.lstrip().startswith("[confident]"):
        errors.append("first line must open with [confident]")
    if "excited" in tags:
        errors.append("[excited] is never allowed (use [slightly excited] once)")
    se = tags.count("slightly excited")
    if series == "chip" and se != 1:
        errors.append(f"[slightly excited] must appear exactly once, found {se}")
    elif se > 1:
        errors.append(f"[slightly excited] at most once, found {se}")
    pauses = tags.count("pause")
    if pauses > 3:
        errors.append(f"[pause] used {pauses} times (max 3)")
    if re.search(r"\]\s*\[", block):
        errors.append("two tags in a row")
    if "<break" in block:
        errors.append("SSML <break> tags are not allowed")

    for i, b in enumerate(beats, 1):
        emo = [t for t in TAG.findall(b) if t.strip() not in CUE_TAGS]
        if len(emo) > 1:
            errors.append(f"beat {i} has {len(emo)} emotion tags (max 1): {emo}")
        caps = [w for w in re.findall(r"\b[A-Z]{2,}\b", strip_tags(b)) if w not in ALLOWED_CAPS]
        if len(caps) > 1:
            errors.append(f"beat {i} has {len(caps)} CAPS words (max 1): {caps}")
        links = [s.split()[0].strip(",").lower() for s in sentences(b)]
        if sum(1 for w in links if w in LINK_WORDS) > 1:
            errors.append(f"beat {i} uses more than one spoken link (So/But/Now/Watch)")
        for a, c in zip(links, links[1:]):
            if a == c and a in LINK_WORDS:
                errors.append(f"beat {i}: two sentences in a row start with \"{a}\"")

    # hook
    hook = beats[0]
    if len(words(hook)) > 9:
        errors.append(f"hook has {len(words(hook))} words (max 9)")
    first_caps = [w for w in re.findall(r"\b[A-Z]{2,}\b", strip_tags(hook)) if w not in ALLOWED_CAPS]
    if len(first_caps) != 1:
        errors.append(f"hook must carry exactly one CAPS word, found {first_caps}")
    if TAG.search(block) and TAG.search(block).group(1).strip() == "curious":
        errors.append("never open with [curious]")

    # line after the hook must pick up the hook in its own words
    if len(beats) > 1:
        second = beats[1]
        shared = content_words(hook) & content_words(second)
        if len(words(second)) <= 4 or not shared:
            errors.append("line after the hook must restate the viewer's question in the hook's own words "
                          f"(shares no key word with the hook, or is too short): \"{strip_tags(second)}\"")
        else:
            notes.append(f"hook follow-up reuses: {sorted(shared)}")

    # series line
    low = strip_tags(block).lower()
    word = num_word(episode)
    if series == "chip":
        line = f"let's understand this in episode {word} of chip design."
        if line not in low:
            errors.append(f"series line missing: \"Let's understand this in episode {word} of chip design.\"")
        else:
            beat = next(b for b in beats if line in strip_tags(b).lower())
            if "[thoughtful]" not in beat:
                errors.append("series line must follow the [thoughtful] takeaway in the same beat")
        if "now, the same with bits." not in low:
            errors.append("fold line \"[pause] Now, the same with bits.\" missing")
    else:
        name = "digital electronics" if series == "de" else "verilog"
        line = f"welcome to episode {word} of {name}."
        if line not in low:
            errors.append(f"series line missing: \"Welcome to episode {word} of {name.title()}.\"")
    nxt = num_word(episode + 1)
    if f"episode {nxt}" not in strip_tags(beats[-1]).lower():
        errors.append(f"teaser (last beat) must lead to \"episode {nxt}\"")
    if series == "chip" and "[curious]" not in beats[-1]:
        notes.append("note: teaser usually carries [curious]")

    for f in FILLER:
        if f in low:
            errors.append(f"filler phrase: \"{f}\"")
    for pat in CROSS_REF:
        for m in re.finditer(pat, low):
            ctx = low[max(0, m.start() - 20):m.end() + 20]
            if "let's understand this in episode" in ctx or "that's episode" in ctx or "welcome to episode" in ctx:
                continue
            errors.append(f"episodes stand alone, found \"{m.group(0)}\" in \"...{ctx}...\"")
    for ch in RAW_SYMBOLS:
        if ch in strip_tags(block):
            errors.append(f"raw symbol \"{ch}\" in the block (spell it for speech)")
    return errors, notes


def check_quotes(page, block):
    """Every voice quote in sections 3 and 4 must be text that is actually in the block."""
    errors = []
    spoken = " ".join(norm(block))
    s3 = page.split("## 3.", 1)[1] if "## 3." in page else ""
    quotes = []
    for line in s3.splitlines():
        if not line.startswith("|") or line.startswith("| ---") or line.startswith("| Step"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 5:
            quotes += re.findall(r"\"([^\"]+)\"", cells[2])                      # Voice column
            quotes += re.findall(r"\(\"([^\"]+)\"\)", cells[3])                  # ("word") anchors on screen
            quotes += re.findall(r"\(on \"([^\"]+)\"", cells[3] + " " + cells[4])  # (on "word") anchors
            quotes += re.findall(r"on \"([^\"]+)\" \(pen mark\)", cells[4])
    s4 = page.split("## 4.", 1)[1] if "## 4." in page else ""
    quotes += re.findall(r"<b>\"([^\"]+)\"</b>", s4)
    quotes += re.findall(r"\*\*\"([^\"]+)\"\*\*", s4)
    for q in quotes:
        qn = " ".join(norm(q))
        if qn and qn not in spoken:
            errors.append(f"quote not in the block (stale after an edit?): \"{q}\"")
    return errors, len(quotes)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--series", choices=["chip", "de", "verilog"], required=True)
    ap.add_argument("--episode", type=int, required=True)
    ap.add_argument("file")
    a = ap.parse_args()
    text = open(a.file, encoding="utf-8").read()
    block, is_page = extract_block(text)
    errors, notes = check(block, a.series, a.episode)
    if is_page:
        qerr, nq = check_quotes(text, block)
        errors += qerr
        notes.append(f"voice quotes checked in sections 3-4: {nq}")
    for x in notes:
        print("  " + x)
    if errors:
        print(f"FAIL ({len(errors)})")
        for e in errors:
            print("  - " + e)
        sys.exit(1)
    print("PASS (countable rules only; now do the written cold-viewer pass)")


if __name__ == "__main__":
    main()
