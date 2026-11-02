import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-kmap-eggs-voice.tsx",
  out: "shorts/chip-design/08 How does a Karnaugh map simplify logic/How does a Karnaugh map simplify logic (egg carton, voice).html",
  title: "How does a Karnaugh map simplify logic",
  model: "src/figures/kmap-eggs/voice.ts",
});
