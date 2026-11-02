import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-hex-without-sample.tsx",
  out: "testers/hex-without-sample.html",
  title: "Why do engineers write binary as hexadecimal",
});
