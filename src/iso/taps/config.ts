// What an episode in the taps world sets: which parts are on, the labels, the readout, and its model (stateAt).
import type { TapsWorld } from "./geometry";
import type { TapsGraph } from "./graph";
import type { TapsState } from "./model";

export type TapsParts = {
  meter: boolean; // water meter with needle and two-drum cup counter on the fill drop
  grate: boolean; // floor drain grate (GND's water part) and the splash
  tags: boolean; // FILL / DRAIN plates on the taps
  glint: boolean; // tank glint (beat tankGlint)
  slowmo: boolean; // "slow-mo" engraving beside the handle (beat slowmo)
  drip: boolean; // one drop from the drain tap (state drip)
  ghost: boolean; // ghost water handle beside the circuit lever (state ghost)
};

export type TapsConfig = {
  world: TapsWorld;
  parts: TapsParts;
  labels: {
    brand: string; // maker's plate on the high tank (ROLLIN)
    vdd: string;
    gnd: string;
    pmos: string;
    nmos: string;
    fill: string;
    drain: string;
    load: string;
    cups: string;
    slowmo: string;
    vin: (h: number) => string; // engraved input value under the lever
  };
  readout?: {
    below?: number; // readout top, in stage px of 600 (default 310, under the circuit board)
    graph?: {
      g: TapsGraph;
      vtn: number;
      vtp: number;
      areas: number; // shaded pulse areas (1-2)
      edges: { text: string; anchor: "start" | "middle" | "end" }[];
      vinName: string;
      iName: string;
      bandName: string;
    };
    counter?: { name: string; rows: string[] };
  };
  stateAt: (t: number) => TapsState;
  loop: number;
  reducedAt: number; // the frame shown with reduced motion (the key state)
  label: string; // the stage's aria label
};
