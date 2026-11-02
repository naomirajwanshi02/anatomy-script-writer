import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-parity-wash-voice.tsx",
  out: "shorts/chip-design/05 How does a parity bit detect errors/How does a parity bit detect errors (washing machine, voice).html",
  title: "How does a parity bit detect errors",
  model: "src/figures/parity-wash/voice.ts",
});
