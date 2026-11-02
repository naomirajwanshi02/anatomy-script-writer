import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-parity-wash-sample.tsx",
  out: "testers/parity-wash-sample.html",
  title: "How does a parity bit detect errors?",
});
