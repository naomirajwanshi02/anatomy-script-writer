import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-engineer-styles-sample.tsx",
  out: "testers/engineer-styles.html",
  title: "Engineer styles: pick one for the without-it desk scenes",
});
