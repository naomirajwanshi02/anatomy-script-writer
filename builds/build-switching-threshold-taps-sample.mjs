import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-switching-threshold-taps-sample.tsx",
  out: "testers/switching-threshold-taps-sample.html",
  title: "What is the switching threshold of an inverter?",
});
