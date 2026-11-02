import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-decoder-intercom-sample.tsx",
  out: "testers/decoder-intercom-sample.html",
  title: "What does a decoder do in a memory chip?",
});
