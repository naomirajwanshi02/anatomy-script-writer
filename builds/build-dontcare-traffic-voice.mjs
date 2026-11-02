import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-dontcare-traffic-voice.tsx",
  out: "shorts/chip-design/09 What are don't-care conditions/What are don't-care conditions (traffic light, voice).html",
  title: "What are don't-care conditions",
  model: "src/figures/dontcare-traffic/voice.ts",
});
