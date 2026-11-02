import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-voltage-tower-sample.tsx",
  out: "testers/voltage-tower-sample.html",
  title: "Why does lowering supply voltage save so much power?",
});
