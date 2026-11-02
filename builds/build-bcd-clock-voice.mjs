import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-bcd-clock-voice.tsx",
  out: "shorts/chip-design/04 What is BCD and why do calculators and clocks use it/What is BCD and why do calculators and clocks use it (alarm clock, voice).html",
  title: "What is BCD and why do calculators and clocks use it",
  model: "src/figures/bcd-clock/voice.ts",
});
