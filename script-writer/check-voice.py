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
FILLER = ["so yeah", "let's dive in", "in this video", "from episode", "like episode"]
IDIOMS = ["not mathing", "suffering from success", "gold rush", "hit the fan", "kool-aid", "par for the course",
          "smoke and mirrors", "holding the bag", "monkey business", "cut out for", "spaghetti monster",
          "betting primate"]
REACTIONS = ("what?", "hold on.", "wait.")
FLIP = re.compile(r"right\?\s*(?:\[[^\]]*\]\s*)?(nope|not quite|not really|well, no|well, not|not exactly|actually, no|wrong|no\.)", re.I)
TURNS = ["here's the thing", "here's the trick", "here's the fix", "here's the weird part", "here's the catch", "here's where", "here's how", "but wait",
         "it gets worse", "what's going on", "let me explain", "turns out"]
OPENERS = re.compile(r"^(because|see,|so\b|now,|okay|well,)", re.I)
SIGNOFF = "Now you can explain what most engineers can't. Follow, and keep it that way."
FIXED = ("Let's watch.", "Now, the same with bits.", "Now, let's build it as a circuit.")
MILD = re.compile(r"\b(hell|damn)\b", re.I)
STRONG = re.compile(r"\b(shit\w*|fuck\w*|bullshit\w*|crap|ass|bitch\w*)\b", re.I)
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
    # Story style (SCRIPTS.md 3a)
    if low.count("basically") > 1:
        E("'basically' more than once")
    for m in re.finditer(r"\bremember\b(.{0,25})", low):
        if re.search(r"episode|last time|before", m.group(1)):
            E("'remember' only for a callback inside the reel ('Remember the lane lines?')")
    if STRONG.search(strip_tags(block)):
        E(f"strong swear word: '{STRONG.search(strip_tags(block)).group(0)}'")
    if len(MILD.findall(strip_tags(block))) > 1:
        E("more than one mild swear word")
    if MILD.search(strip_tags(first)):
        E("no swearing in the hook")
    for i in IDIOMS:
        if i in low:
            E(f"idiom '{i}' breaks the Hindi dub (SCRIPTS.md 3a)")
    if sum(1 for s in sentences(block) if s.lower() in REACTIONS or s.lower() == "wait, what?") > 1:
        E("more than one reaction line ('Wait, what?', 'Hold on.')")
    if len(re.findall(r"\bjust\b", low)) > 2:
        W("'just' more than twice")

    # Tone score (SCRIPTS.md 3a): 20 points per move
    body = sentences("\n\n".join(beats[1:-3]))  # hook, bridge and sign-off not counted
    body_text = " ".join(body)
    tone = {
        "flip ('…, right? Nope.')": bool(FLIP.search(strip_tags(block))),
        "punch (a 1-3 word line)": sum(1 for s in body if len(s.split()) <= 3 and s not in FIXED
                                      and not s.startswith("That's episode")) >= 1,
        "turn phrase ('Here's the thing.')": any(x in body_text.lower() for x in TURNS),
        "chat openers (2+: Because, See, So, Now, Okay, Well)": sum(
            1 for s in body if OPENERS.match(s) and s not in FIXED) >= 2,
        "questions (2+, sign-off not counted)": sum(1 for s in body if s.endswith("?")) >= 2,
    }
    score = 20 * sum(tone.values())
    for k, ok in tone.items():
        if not ok:
            W(f"tone: missing {k}")

    if a.series == "chip":
        if "harry" in content_words(first) or "harry" in strip_tags(first).lower():
            E("Harry belongs in line 2, not the hook (the hook speaks to the viewer)")
    for ch in ["Q̄", *SYMBOLS[2:]]:  # "Q̄" is two code points; a plain Q (as in QUARTER) is fine
        if ch in strip_tags(block).replace("'s", "").replace("'t", "").replace("'re", "").replace("'ll", ""):
            E(f"raw symbol '{ch}': spell it for speech")

    # Series line and teaser
    n = word(a.episode)
    want = (f"Let's understand this in episode {n} of chip design." if a.series == "chip"
            else f"Welcome to episode {n} of {'Digital Electronics' if a.series == 'de' else 'Verilog'}.")
    if want not in block:
        E(f"series line missing or wrong: expected \"{want}\"")
    tail3 = beats[-3:] if len(beats) >= 3 else beats
    signoff_ok = (len(beats) >= 3 and beats[-2].startswith("[pause] [playfully] ") and beats[-1].startswith("[warmly] ")
                  and " ".join(strip_tags(" ".join(beats[-2:])).split()) == SIGNOFF)
    if not signoff_ok:
        E("the reel must end on the sign-off as two beats, word for word: \"[pause] [playfully] Now you can explain what "
          "most engineers can't.\" then \"[warmly] Follow, and keep it that way.\" (SCRIPTS.md section 2)")
    elif not beats[-3].startswith("[confident]"):
        E("the bridge before the sign-off is its own [confident] beat")
    elif not content_words(beats[0]) & content_words(strip_tags(beats[-3])):
        W("the bridge before the sign-off repeats no hook word: the reel will not loop")
    if "That's episode" in block:
        E("no next-episode teaser (\"That's episode …\"): end on the sign-off (SCRIPTS.md section 2)")

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
    print(f"TONE  {score}/100 (SCRIPTS.md 3a, aim 80+)")
    print(f"{'FAIL' if errors else 'PASS'}: {words} words, {len(beats)} beats, "
          f"{len(errors)} errors, {len(warns)} flow warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
