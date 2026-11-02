import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-rtl-synthesis.tsx",
  out: "shorts/verilog/02 What does RTL mean, and what is logic synthesis/What does RTL mean, and what is logic synthesis.html",
  title: "What does RTL mean, and what is logic synthesis",
});
