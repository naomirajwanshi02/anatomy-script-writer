import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-kmap-eggs-sample.tsx",
  out: "testers/kmap-eggs-sample.html",
  title: "How does a Karnaugh map simplify logic?",
});
