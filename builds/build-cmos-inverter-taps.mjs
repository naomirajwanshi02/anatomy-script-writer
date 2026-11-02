import { buildFigure } from "./build-figure.mjs";

await buildFigure({
  entry: "src/main-cmos-inverter-taps.tsx",
  out: "shorts/digital-electronics/05 How does a CMOS inverter work/How does a CMOS inverter work (two taps).html",
  title: "CMOS inverter: two taps",
});
