import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-volume-gray-voice.tsx",
  out: "shorts/chip-design/06 Why does a rotary encoder use Gray code/Why does a rotary encoder use Gray code (volume knob, voice).html",
  title: "Why does a rotary encoder use Gray code",
  model: "src/figures/volume-gray/voice.ts",
});
