import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-bcd-clock.tsx",
  out: "shorts/chip-design/04 What is BCD and why do calculators and clocks use it/What is BCD and why do calculators and clocks use it (alarm clock).html",
  title: "What is BCD and why do calculators and clocks use it",
});
