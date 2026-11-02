import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-regen-convoy2-sample.tsx",
  out: "testers/regen-convoy2-sample.html",
  title: "What is the regenerative property of logic gates? (convoy sample)",
});
