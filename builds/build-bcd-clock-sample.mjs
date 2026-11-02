import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-bcd-clock-sample.tsx",
  out: "testers/bcd-clock-sample.html",
  title: "Why your calculator thinks in decimal",
});
