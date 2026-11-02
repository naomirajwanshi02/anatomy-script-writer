import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-trip-overflow-sample.tsx",
  out: "testers/trip-overflow-sample.html",
  title: "Trip overflow sample",
});
