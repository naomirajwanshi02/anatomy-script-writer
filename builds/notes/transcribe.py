"""Word-level transcript of a voiceover, for timing notes and subtitles.

    .tools/whisper/Scripts/python builds/notes/transcribe.py <audio.mp3> <out.words.json> [--prompt "..."]
    (npm run notes:transcribe -- <audio.mp3> <out.words.json>)

Writes [[start, end, word], ...] in seconds (audio t = video t on voice pages) and prints the words
grouped into phrases (split at pauses over 0.3 s) so cue times can be read straight off the output.
ffmpeg decodes the audio (the PyAV build that faster-whisper ships with fails on mp3 here).
The model (small.en, ~460 MB) downloads once into ~/.cache/huggingface.
"""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

args = sys.argv[1:]
prompt = "Digital Electronics. Binary, transistor, CMOS, NAND, NOR, latch."
if "--prompt" in args:
    i = args.index("--prompt")
    prompt = args[i + 1]
    del args[i : i + 2]
if len(args) != 2:
    sys.exit(__doc__)
audio, out = args

pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
    check=True, capture_output=True,
).stdout
samples = np.frombuffer(pcm, dtype=np.float32)

model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe(samples, word_timestamps=True, initial_prompt=prompt)
words = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for seg in segments for w in seg.words]
with open(out, "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False)

phrase, start = [], None
for i, (a, b, w) in enumerate(words):
    if start is None:
        start = a
    phrase.append(w)
    nxt = words[i + 1][0] if i + 1 < len(words) else None
    if nxt is None or nxt - b > 0.3:
        print(f"{start:6.2f}-{b:6.2f}  {' '.join(phrase)}")
        phrase, start = [], None
print(f"\n{len(words)} words -> {out}")
