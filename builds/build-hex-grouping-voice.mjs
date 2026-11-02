import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-hex-grouping-voice.tsx",
  out: "shorts/chip-design/01 Why do engineers write binary as hexadecimal/Why do engineers write binary as hexadecimal (phone number, voice).html",
  title: "Why do engineers write binary as hexadecimal",
  model: "src/figures/hex-grouping/voice.ts",
});
