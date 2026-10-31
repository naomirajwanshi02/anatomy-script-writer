#!/usr/bin/env python3
"""Check an ElevenLabs voice block against SCRIPTS.md (sections 2-4, 8.2-8.3).

Usage:
  python3 script-writer/check-voice.py FILE --series chip --episode 13
FILE is a plain block, or a page/markdown file: the first ```txt block is used.
Series: chip (170-200 words), de / verilog (180-210 words).
Exit code 1 if any ERROR. WARN lines are flow points to fix or justify by hand.
"""
import argparse, re, sys

NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
       "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
       "nineteen", "twenty"]
TENS = {2: "twenty", 3: "thirty", 4: "forty", 5: "fifty", 6: "sixty", 7: "seventy", 8: "eighty", 9: "ninety"}
STOP = set("""a an the and or but so now then this that these those it its is are was be to of in on
at for with as by from into out up down only just all each every one two three how what why who which
let's lets watch say same here there your you we our they them their not no yes do does can will
if what's that's it's""".split())
EMOTION = re.compile(r"\[(?!pause\])([^\]]+)\]")
LINKS = ("so", "but", "now", "watch")
FILLER = ["basically", "so yeah", "let's dive in", "in this video", "from episode", "like episode", "remember"]
SYMBOLS = "Q̄·'≥≤→×−≈"


def word(n):
    if n <= 20:
        return NUM[n]
    t, u = divmod(n, 10)
    return TENS[t] + ("-" + NUM[u] if u else "")


def load(path):
    text = open(path, encoding="utf-8").read()
    m = re.search(r"```txt\n(.*?)```", text, re.S)
    return (m.group(1) if m else text).strip()


def strip_tags(s):
    return re.sub(r"\[[^\]]*\]", "", s)


def sentences(s):
    return [x.strip() for x in re.split(r"(?<=[.?!])\s+", strip_tags(s).strip()) if x.strip()]


def content_words(s):
    out = set()
    for w in re.findall(r"[a-z']+", strip_tags(s).lower()):
        if w in STOP or len(w) < 3:
            continue
        out.add(w[:-1] if w.endswith("s") and len(w) > 3 else w)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--series", choices=["chip", "de", "verilog"], required=True)
    ap.add_argument("--episode", type=int, required=True)
    a = ap.parse_args()

    block = load(a.file)
    beats = [b.strip() for b in re.split(r"\n\s*\n", block) if b.strip()]
    errors, warns = [], []
    E, W = errors.append, warns.append

    # Length
    words = len(strip_tags(block).split())
    lo, hi = (170, 200) if a.series == "chip" else (180, 210)
    if not lo <= words <= hi:
        E(f"word count {words}, needs {lo}-{hi}")

    # Sentences
    for s in sentences(block):
        n = len(s.split())
        if n > 15:
            E(f"sentence over 15 words ({n}): {s}")
        if re.fullmatch(r"(So,? )?(How|Why|What|Really|Wait)\?", s):
            E(f"bare question '{s}': name the hook's object and action (SCRIPTS.md 4, second line)")

    # First line
    first = beats[0]
    if not first.startswith("[confident]"):
        E("first line must open with [confident]")
    if len(re.findall(r"\b[A-Z]{2,}\b", strip_tags(first))) != 1:
        E("first line needs exactly one CAPS word")
    hook_words = len(strip_tags(first).split())
    if hook_words > 9:
        E(f"hook is {hook_words} words, max 9")

    # Second line picks up the hook in the hook's own words
    if len(beats) > 1:
        shared = content_words(beats[0]) & content_words(beats[1])
        if not shared:
            E("line after the hook shares no word with the hook: take up the viewer's question in the hook's words")

    # Tags and emphasis
    if block.count("[slightly excited]") > 1:
        E("[slightly excited] used more than once")
    if re.search(r"\[excited\]", block):
        E("[excited] is not allowed (use [slightly excited] once)")
    if block.count("[pause]") > 3:
        E("more than 3 [pause]")
    if "<break" in block:
        E("no SSML <break> tags")
    for i, b in enumerate(beats, 1):
        tags = [t for t in EMOTION.findall(b) if t != "pause, then normally"]
        if len(tags) > 1:
            E(f"beat {i} has {len(tags)} emotion tags: {tags}")
        caps = re.findall(r"\b[A-Z]{2,}\b", strip_tags(b))
        caps = [c for c in caps if c not in ("NAND", "NOR", "XOR", "AND", "OR", "NOT", "RTL", "VDD")]
        if len(caps) > 1:
            E(f"beat {i} has {len(caps)} CAPS words: {caps}")

    # Words and symbols
    low = strip_tags(block).lower()
    for f in FILLER:
        if f in low:
            E(f"banned phrase: '{f}'")
    for ch in SYMBOLS:
        if ch in strip_tags(block).replace("'s", "").replace("'t", "").replace("'re", "").replace("'ll", ""):
            E(f"raw symbol '{ch}': spell it for speech")

    # Series line and teaser
    n = word(a.episode)
    want = (f"Let's understand this in episode {n} of chip design." if a.series == "chip"
            else f"Welcome to episode {n} of {'Digital Electronics' if a.series == 'de' else 'Verilog'}.")
    if want not in block:
        E(f"series line missing or wrong: expected \"{want}\"")
    if f"That's episode {word(a.episode + 1)}." not in block:
        E(f"teaser must end \"That's episode {word(a.episode + 1)}.\"")

    # Spoken links: not two sentences in a row with the same one
    prev = None
    for s in sentences(block):
        lead = re.match(r"[A-Za-z]+", s)
        lead = lead.group(0).lower() if lead else None
        if lead in LINKS and lead == prev:
            E(f"two sentences in a row start with '{lead}': {s}")
        prev = lead

    # Flow: each beat should pick up a word from the beat before (review by hand)
    for i in range(1, len(beats)):
        if strip_tags(beats[i]).strip() in ("Now, the same with bits.", "Now, let's build it as a circuit."):
            continue  # the fixed fold line
        if not content_words(beats[i - 1]) & content_words(beats[i]):
            W(f"beat {i + 1} shares no word with beat {i}: check it does not open cold\n"
              f"      {strip_tags(beats[i]).strip()[:90]}")

    for e in errors:
        print("ERROR", e)
    for w in warns:
        print("WARN ", w)
    print(f"{'FAIL' if errors else 'PASS'}: {words} words, {len(beats)} beats, "
          f"{len(errors)} errors, {len(warns)} flow warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
