import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-full-adder-columns-voice.tsx",
  out: "shorts/chip-design/12 How does a full adder work/How does a full adder work (paper columns, voice).html",
  title: "How does a full adder work?",
  model: "src/figures/full-adder-columns/voice.ts",
});
