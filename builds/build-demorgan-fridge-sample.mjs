import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-demorgan-fridge-sample.tsx",
  out: "testers/demorgan-fridge-sample.html",
  title: "What is De Morgan's theorem and why do designers use it?",
});
