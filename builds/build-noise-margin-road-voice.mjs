import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-noise-margin-road-voice.tsx",
  out: "shorts/chip-design/10 What are noise margins/What are noise margins (road, voice).html",
  title: "What are noise margins?",
  model: "src/figures/noise-margin-road/voice.ts",
});
