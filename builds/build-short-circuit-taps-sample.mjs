import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-short-circuit-taps-sample.tsx",
  out: "testers/short-circuit-taps-sample.html",
  title: "What is short-circuit power in CMOS?",
});
