# Understanding test: one viewer, analogy then circuit

The other checks test rules (words, timing, overlaps). This one tests what the reel is for (owner, 2026-11-02): **a 15-year-old must understand the analogy, and a first-year BTech student must then learn the real circuit from it.** Episode 17 (water tower) passed every rule check and still taught nothing; the first redo then lost its circuit because one "never studied electronics" viewer judged the whole reel. So the test asks two viewer questions, each judging the half that is made for it: the 15-year-old's and the BTech student's.

It has two parts (token budget, owner 2026-11-02; ep 18 spent 4 blind runs, and the script-stage runs found nothing the video run did not):
- **Script stage** (`/script`, before Notion): a **self-check** on the storyboard (`python script-writer/storyboard.py page.md`), with no subagents (section 0).
- **Video stage** (`/htmlmp4`, on the annotated notes page, before the sign-off and export): the **blind test**, once, on real frames every 3.5 s (sheets at scale 0.3) plus the words heard at each frame (`node builds/notes/heard.mjs <words.json> 3.5`). The handwritten notes are part of what a viewer sees, so the test runs after them.

The blind test uses **one fresh viewer agent** (Agent tool, general-purpose, Sonnet, never one that has seen the page, the rules or this file's grading part; token budget, owner 2026-11-02). It answers the two prompts in order, each word for word:
1. Start the agent with the sheets, the heard lines and the **analogy viewer** prompt (section 1). Wait for its answer.
2. Only after that answer is written, send the **circuit viewer** prompt (section 2) to the same agent with SendMessage, so the first answer is not shaped by the second question.

The **main session grades** both answers with letters A-H (section 3), checking every claim against the viewer's actual words. A re-test, when the owner asks for one, always uses a new agent. Digital electronics and Verilog reels with no analogy send only the circuit viewer prompt.

## 0. Storyboard self-check (script stage, no subagents)

The main session reads the storyboard once, in order, and answers both viewers' questions (sections 1 and 2) as those viewers would, using only what the storyboard shows and says at each second, never what it knows from writing the page. Then it grades its own answers with letters A-H (section 3), at the same strictness: a borderline letter is a FAIL. Write the answers and letters in scratch. Check especially what a blind viewer stumbles on (ep 18): every cause has its own visible action at the second the voice names it; the key action is large and slow enough to see (not a 0.5 s flick without a replay); every number the voice says matches the figure at that second; every circuit part gets its proper label when named, and the output load is named. Fix every FAIL in the page, re-run the checkers, and record "Storyboard self-check: A-H PASS" in the page's second note line.

## 1. Analogy viewer prompt (blind, 15; sent first)

Give the agent only the frame sheets plus heard words, and this prompt, word for word:

> You are 15. You are scrolling reels on your phone and this one plays once. You have never studied electronics. Below is exactly what you see and hear, second by second. Watch it once, in order, like a viewer: do not study it, do not reread, do not use anything you know beyond what a normal 15-year-old knows. Judge only the everyday part (before it turns into a chip); the chip part is not for you.
>
> Then answer, in plain words, as you would to a friend:
> 1. What question was the video about?
> 2. What is the answer, in the everyday example?
> 3. Why is that true? Explain it in 2-3 sentences of your own, without repeating the video's sentences. If you can only repeat what it said, say "I can only repeat it".
> 4. Which moment on screen made it click? Give the second and what you saw. If nothing made it click, say so.
> 5. Where in the everyday part did you get lost or stop seeing what the voice meant? Give each second and why.
>
> Keep it under 200 words. Be honest: saying "I didn't get it" is the most useful answer.

## 2. Circuit viewer prompt (blind, first-year BTech; sent second)

To the same agent, after its first answer, this prompt, word for word:

> You are a first-year BTech student. You know school physics (charge, voltage, current, energy, capacitors in a formula) and you have heard of transistors, but you have not studied chip design. This reel plays once on your phone. Below is exactly what you see and hear, second by second. Watch it once, in order, like a viewer.
>
> Then answer:
> 1. What circuit was shown, and what does each part do? Use the proper names.
> 2. Explain the concept in proper terms, in 3-4 sentences of your own (what happens in the circuit, and why the answer is true). If you can only repeat what it said, say "I can only repeat it".
> 3. Match the everyday example to the circuit: which everyday part is which circuit part or quantity?
> 4. Which circuit moment made it click? Give the second and what you saw.
> 5. Where in the circuit part did you get lost? Give each second and why (too fast, a part too small, a term not explained, a jump you could not follow).
>
> Keep it under 250 words. Be honest.

## 3. Grading (main session)

The main session grades, with no grader agent. Write down first, in scratch, the page's takeaway (the `[thoughtful]` answer line and the end-card takeaway), the CSV concept, the mechanism in one sentence (the real cause in circuit terms) and the analogy-to-circuit mapping (from the page). Then apply this checklist to the two answers, at full strictness:

> Grade the reel. PASS only if every letter holds.
> Analogy viewer (15):
> A. Their answer (2) matches the takeaway in the everyday example.
> B. Their why (3) gives every cause in their own words (for a "twice" or "both" idea: both causes, each separately). A restated sum ("half times half is a quarter") is not understanding.
> C. Their click (4) is a picture: something they SAW happen in the everyday example that shows the cause.
> D. No lost moment (5) falls on the analogy's key action. The hook is meant to raise the question; a lost moment there is a WARN.
> Circuit viewer (BTech):
> E. Their circuit (1) names the real parts correctly and what each does.
> F. Their explanation (2) states the mechanism correctly in proper terms, every cause in it, in their own words.
> G. Their matching (3) pairs the analogy parts with the right circuit parts or quantities.
> H. No lost moment (5) falls on the circuit's key state. A lost moment at the fold or on one term is a WARN.
> A letter you would call borderline, weak or "acceptable" is a FAIL: an agent reading frames is more patient than a real viewer watching once. Do not count a misread: check each claim against the viewer's actual words.
> Result: PASS or FAIL, then one line per letter (quote the viewer's words it rests on), then the WARNs, then the 1-3 most important fixes (what to show, not what to say), each with its second.

The analogy letters A-D grade the first answer (15-year-old), E-H the second (BTech). Grade from what the viewer wrote, not from what the main session knows the reel shows: a cause the viewer did not put in their own words is missing.

## 4. What to do with the result

- **PASS:** record "Understanding test: PASS (video)" in the chat summary and the reel-builds row (the script stage records its self-check, section 0).
- **FAIL on A-D (analogy):** fix the story, not the wording: give each cause its own visible action on the analogy object (something that moves, fills, counts or breaks), cut parts that arrive before they are needed, replace charts with something to count or see. If the analogy cannot show the cause, go back to SCRIPTS.md rule 0 and offer new analogies.
- **FAIL on E-H (circuit):** the circuit must stay a real circuit (SCRIPTS.md section 2, circuit rule). Fix by showing, not by removing parts: bigger parts, one new part per spoken line, its proper label on screen when the voice names it, the analogy part it stands for shown beside it (ghost or label), the same counts as the analogy.
- **Budget (owner, 2026-11-02: best video, fewest tokens):** **one blind run per episode**, at the video stage. A lost moment on pacing, size or visibility (D, H, WARNs) gets a figure or cue fix in the same round, with no retest. A real understanding fail (A-C, E-G: the why, the click, the parts, the mechanism, the mapping) is reported to the owner with the viewer's two answers and the letters; the owner decides whether one retest runs (at most one). The test is a diagnostic, not a gate to loop on: ep 17 spent 13 runs, and every run after the second found new nitpicks rather than new problems.
- Use Sonnet for the viewer agent; the main session grades.
- Before acting on a grade, check each claim against the viewer's actual words (ep 17's grader agent twice misread them).
- **Video stage FAIL:** report the lost seconds and the fixes from the grading to the owner before the export. Size or timing fixes go to the figure or the notes; story fixes go back to `/script`.
- Never weaken the prompts or coach the viewers to pass.
