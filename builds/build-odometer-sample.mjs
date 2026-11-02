import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-odometer-sample.tsx",
  out: "testers/odometer-sample.html",
  title: "Odometer sample",
});
