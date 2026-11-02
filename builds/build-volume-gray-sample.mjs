import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-volume-gray-sample.tsx",
  out: "testers/volume-gray-sample.html",
  title: "Why does a rotary encoder use Gray code?",
});
