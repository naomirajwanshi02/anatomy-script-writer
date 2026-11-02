// Hand-drawn series badge. One page per episode: node builds/build-badge-sketch.mjs --ep 14
// (the episode number is read back from the page title).
import { buildFigure } from "./build-figure.mjs";

const args = process.argv.slice(2);
const i = args.indexOf("--ep");
const ep = String(i >= 0 ? Number(args[i + 1]) : 1).padStart(2, "0");

await buildFigure({
  entry: "src/main-badge-sketch.tsx",
  out: `shorts/overlays/Series badge sketch ${ep}.html`,
  title: `Series badge sketch ${ep}`,
});
