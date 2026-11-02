import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-demorgan-fridge-voice.tsx",
  out: "shorts/chip-design/07 What is De Morgan's theorem and why do designers use it/What is De Morgan's theorem and why do designers use it (fridge, voice).html",
  title: "What is De Morgan's theorem and why do designers use it",
  model: "src/figures/demorgan-fridge/voice.ts",
});
