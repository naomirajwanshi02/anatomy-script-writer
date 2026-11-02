import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-trip-overflow-voice.tsx",
  out: "shorts/chip-design/03 What is arithmetic overflow and how is it detected/What is arithmetic overflow and how is it detected (trip counter, voice).html",
  title: "What is arithmetic overflow and how is it detected",
  model: "src/figures/trip-overflow/voice.ts",
});
