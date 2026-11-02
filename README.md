# Reel kit (script + HTML figure + reel MP4)

The script kit plus everything `/htmlmp4` and `/new-figure` need: figure sources (`src/`), build and capture scripts (`builds/`), the notes pipeline (`builds/notes/`), fonts, Samble, backdrop paper. Built videos (`shorts/`) and `node_modules` are not included.

## Set up

1. **Folder location:** any folder works. Figure sources write font URLs as `__ANATOMY_ROOT__/fonts/...`, and `builds/build-figure.mjs` fills in the project folder's absolute `file://` URL at build time (the notes pipeline already resolves Samble from the project folder). Rebuild a page after moving the project.
2. Open the folder in Claude Code. Keep the hidden `.claude` folder.
3. Install **Node 22+**, **Google Chrome** and **ffmpeg** (on PATH), then run `npm install` in the folder.
4. Install **Python 3** for the checkers.
5. **Transcribe (voice timing):** create the whisper env the scripts expect:
   ```
   python -m venv .tools\whisper
   .tools\whisper\Scripts\pip install faster-whisper numpy
   ```
6. Connect Notion (claude.ai Settings > Connectors > Notion) and share the **Shorts** page with the `book-concepts.csv`, `digital-electronics.csv` and `verilog.csv` databases (same names).

## Use

- Script: `/script video 20 chip design`
- Figure and reel after recording the voice: `/htmlmp4 chip 20 <path to mp3>` (run it in a new chat)
- New figure by hand: `/new-figure <spec>`

Outputs go to `shorts/<series>/<NN> <interview question>/`. The grid backdrop page is in `shorts/backdrops/`; render it once with `node builds/capture.mjs "shorts/backdrops" --scale 1 --fps 30`.

## Not included

Earlier episodes' built pages, voice mp3s and videos (`shorts/`, about 67 GB). Sources for every figure are in `src/figures/`, so `/htmlmp4` can copy any older figure as a starting point.
