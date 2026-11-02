#!/usr/bin/env python3
"""Storyboard for the understanding test (UNDERSTANDING-TEST.md): what a viewer hears and sees, row by row.

Usage: python script-writer/storyboard.py PAGE.md > storyboard.txt

Reads the page's 3-column table. Hearing = column 1 without tags. Seeing = column 2 without the builder's notes
(model rules, "Key state.", cue-word quotes). Handwriting = the words of each NOTE in column 3. Nothing else from the
page (rules, takeaway labels, ElevenLabs notes) reaches the viewer.
"""
import re, sys

sys.stdout.reconfigure(encoding="utf-8")
text = open(sys.argv[1], encoding="utf-8").read()
text = re.sub(r"<b>([\d.]+-[\d.]+ s)</b>", r"**\1**", text).replace("\\[", "[").replace("\\]", "]").replace("\\^", "^")
for line in text.splitlines():
    if not line.startswith("| **"):
        continue
    cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
    if len(cells) != 3:
        continue
    t = re.match(r"\*\*([\d.]+-[\d.]+ s)\*\*\s*(.*)", cells[0])
    hear = " ".join(re.sub(r"\[[^\]]*\]", "", t.group(2)).split())
    see = cells[1]
    see = re.sub(r"Computed[^.]*?:[^|]*?(?=(\s\d+(\.\d+)?\s\(|$))", "", see)  # model rules for the builder
    see = re.sub(r"\((?:computed|from the model)[^)]*\)", "", see)
    see = re.sub(r"Key state\.\s*|Key hold[^.]*\.\s*", "", see)
    see = re.sub(r" on (?:a|the) [^;,.]*?e\^\(-t/τ\)[^;,.]*? curve| on the RC curve|\s*\(e\^\(-t/τ\)\)", "", see)  # curve formulas
    see = re.sub(r"\s*\((?:the )?start frame[^)]*\)|\(entrance\)", "", see)
    see = re.sub(r'(\d+(?:\.\d+)?) \("[^"]*"\):', r"\1:", see)  # drop cue-word quotes, keep the second
    notes = re.findall(r'NOTE "([^"]+)"', cells[2])
    print(f"[{t.group(1)}]")
    print(f"  You hear: {hear}")
    print(f"  You see: {' '.join(see.split())}")
    if notes:
        print(f"  Handwritten on screen: {' / '.join(notes)}")
    print()
