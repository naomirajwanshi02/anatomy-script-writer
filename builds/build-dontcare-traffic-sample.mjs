import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-dontcare-traffic-sample.tsx",
  out: "testers/dontcare-traffic-sample.html",
  title: "What are don't-care conditions?",
});
