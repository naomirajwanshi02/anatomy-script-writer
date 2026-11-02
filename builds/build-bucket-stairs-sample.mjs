import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-bucket-stairs-sample.tsx",
  out: "testers/bucket-stairs-sample.html",
  title: "Why does lowering supply voltage save so much power?",
});
