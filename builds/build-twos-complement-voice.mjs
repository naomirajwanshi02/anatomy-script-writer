import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-twos-complement-voice.tsx",
  out: "shorts/chip-design/02 How does a computer subtract using only an adder/How does a computer subtract using only an adder (odometer, voice).html",
  title: "How does a computer subtract using only an adder",
  model: "src/figures/twos-complement/voice.ts",
});
