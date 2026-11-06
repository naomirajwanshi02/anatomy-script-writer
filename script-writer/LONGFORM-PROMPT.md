You are writing a long-form YouTube explainer script for my channel Rollin (chip design and digital electronics). Match the style, tags and page layout of the finished reference: the Notion page **Youtube → Why Can't Your CPU Just Run at 10 GHz** (backup in the repo: `scripts/longform/Why can't your CPU just run at 10 GHz.md`). Read it in full before writing.

Topic: <TOPIC>

## 1. Shape

- 16:9, about 14-18 minutes, about 2,400-2,800 words, timed at 2.9 words per second plus pauses.
- 10-12 chapters, 2-6 beats each (a beat = one paragraph = one on-screen action). Number beats chapter.beat (0.1, 0.2, 1.1 ...).
- Chapter 0 (about 1 min): open on a concrete real-world fact (a spec sheet, a product, a date), show the expected trend and that it "never happened", ask 2-3 candidate explanations, state the popular myth and why it sounds right, promise what we'll learn ("In today's video, we're going to learn ..."), then "Hi friends, welcome to Rollin."
- Middle chapters: each opens with the viewer's next question ("Okay, but can't we just ...?", "So why not ...?"), answers it, and hands over to the next question. Every line connects to the one before.
- Second-to-last chapter: the opposite extreme or a real record that tests the idea, then the myth callback.
- Last chapter: "And that's it for now." Say what we simplified or skipped (one line each), tease the next video with a question, then "If you liked this video or learned something new, hit the like button. It really helps the channel. See you in the next one."

## 2. How to teach

- Plain description first, worked example second, the name last: "Let's say R is 10 kilohms ... That gives about 7 picoseconds. This small wait is called the gate delay."
- One everyday analogy introduced early and reused across chapters (in the reference: the bucket and the narrow pipe). Do not swap analogies midway.
- Expand every acronym the first time ("a CPU, a central processing unit"). Define jargon in a clause, not a lecture.
- Use small round numbers the viewer can follow, show the multiplication, and say "about" when rounded. Compute every number in a scratch script first; never by eye.
- Real history and products with dates (launches, cancellations, records). Every factual claim must have a source in the References list. If you cannot source it, cut it.
- Professional tone: calm, clear, no hype, no slang, no "bro". English only.

## 3. ElevenLabs expression tags (keep them small)

- Only mild forms: [slightly confident], [mildly curious], [slightly thoughtful], [slightly serious], [slightly emphatic], [slightly wry], [lightly amused], [slightly warm]. Never the full-strength versions ([excited], [curious], [thoughtful] ...).
- Density: about one tag per 40 seconds of video, 1-3 per chapter, roughly half the beats untagged (the reference has 24 tags in 16:20). Untagged lines read in the default calm voice.
- Put tags only on turning points: the opening line ([slightly confident], never a curious tag first), each chapter's opening question ([mildly curious]), the big reveals ([slightly emphatic], at most one per chapter), a warning or a wrong answer ([slightly serious]), the hello and goodbyes ([slightly warm]). [lightly amused] and [slightly wry] at most once each per video.
- A tag can carry over to the next lines within one generation; if a beat after [lightly amused] or [slightly wry] is serious, plan a [neutral] there.
- Tags go at the start of a sentence, inline in the voice text. Character counts include the tags.

## 4. Output (Notion page under Youtube, same layout as the reference)

1. Intro: one-line premise and format, then "Planned length **m:ss**, N words in N beats across N chapters ..."
2. `## ElevenLabs script`: "One generation per chapter (blocks below), 2-3 takes each." plus the tag list; then for each chapter `### NN Title (m:ss to m:ss, N characters)` and one ```txt block, one paragraph per beat, final text only.
3. The ElevenLabs note and the timing note.
4. One 3-column table: `| ElevenLabs script | On the board | Annotation |`. A bold header row per chapter (`<b>m:ss · Chapter N: Title</b>`), then one row per beat: `<b>m:ss.s-m:ss.s</b> (N.N) voice text` | what the explainer shows (the presenter dot, scene, sliders, readouts, computed values) | optional iPad mark or "Nothing."
5. `## YouTube chapters` (txt block), `## Files`, `## Production notes`, `## References` (numbered, title - publisher, link), `## Caption` (one line plus #chipdesign #vlsi #semiconductors #aihardware #aichips).

Create the page under the Notion page **Youtube** (search for it), titled with the video's title. Then save the same content in the repo as `scripts/longform/<Title>.md`, commit and push.

Before writing, send me a one-screen outline (chapter titles, the analogy, the myth, the key numbers and their sources) and wait for my OK.
