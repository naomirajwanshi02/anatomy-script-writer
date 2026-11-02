import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-regen-convoy2-voice.tsx",
  out: "shorts/chip-design/11 What is the regenerative property of logic gates/What is the regenerative property of logic gates (convoy, voice).html",
  title: "What is the regenerative property of logic gates?",
  model: "src/figures/regen-convoy2/voice.ts",
});
