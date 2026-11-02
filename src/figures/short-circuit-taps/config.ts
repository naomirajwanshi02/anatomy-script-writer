// Episode 18 in the taps world (src/iso/taps): every part on, the default layout, the Vin / I-from-VDD graph and the
// energy-lost counter. The numbers and the timeline live in model.ts.
import { makeTapsWorld } from "../../iso/taps/geometry";
import type { TapsConfig } from "../../iso/taps/config";
import { BRAND, GRAPH, LOOP, SHARP, SLOW, stateAt, VTN, VTP } from "./model";

export const CONFIG: TapsConfig = {
  world: makeTapsWorld(),
  parts: { meter: true, grate: true, tags: true, glint: true, slowmo: true, drip: true, ghost: true },
  labels: {
    brand: BRAND,
    vdd: "VDD 1 V",
    gnd: "GND",
    pmos: "PMOS",
    nmos: "NMOS",
    fill: "FILL",
    drain: "DRAIN",
    load: "load C",
    cups: "cups",
    slowmo: "slow-mo",
    vin: (h) => `Vin ${h.toFixed(1)} V`,
  },
  readout: {
    graph: {
      g: GRAPH,
      vtn: VTN,
      vtp: VTP,
      areas: 2,
      edges: [
        { text: `${SHARP} s`, anchor: "start" },
        { text: `${SLOW} s`, anchor: "middle" },
      ],
      vinName: "Vin",
      iName: "I from VDD (mA)",
      bandName: "both on",
    },
    counter: { name: "energy lost", rows: [`${SHARP} s`, `${SLOW} s`] },
  },
  stateAt,
  loop: LOOP,
  reducedAt: 63,
  label:
    "A water rig on a square board: a high tank on a stand (maker's plate ROLLIN) feeds a fill pipe through a water meter with a cup counter to the fill tap over a glass tank; a drain pipe leaves the tank through the drain tap into a floor grate. One handle drives both taps. At the middle mark both taps are half open and water runs straight through the tank into the drain while the meter counts. A flick of the handle loses one cup, a slow five second turn ten. The board then becomes a CMOS inverter: the high tank the VDD rail, the grate GND, the taps a blue PMOS and a red NMOS, the handle the input lever, the tank the output tank. As the input rises the NMOS turns on at 0.3 V before the PMOS turns off at 0.7 V, and current runs from VDD straight to GND. A graph of Vin and the current from VDD shows a narrow pulse for a 0.5 s edge and a ten times wider pulse for a 5 s edge, with energy lost 1 and 10.",
};
