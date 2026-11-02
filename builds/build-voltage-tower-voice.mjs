import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-voltage-tower-voice.tsx",
  out: "shorts/chip-design/17 Why does lowering supply voltage save so much power/Why does lowering supply voltage save so much power (water tower, voice).html",
  title: "Why does lowering supply voltage save so much power?",
  model: "src/figures/voltage-tower/voice.ts",
});
