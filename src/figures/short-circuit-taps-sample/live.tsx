"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { loopTime } from "../../iso/entrance";
import { waterSvg } from "../../iso/analogy/water";
import { BulbGlowDef } from "../../iso/react/bulb";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { boxWater, contacts, contacts2, out2, STAGE2_H, STAGE_H, STAGE_W, type Box } from "./geometry";
import { LOOP } from "./model";

// Ripple: phases advance a whole number of turns per loop, so the last frame matches the first.
const SLOSH: [Box, number, number][] = [
  ["supply", 0.35, 0],
  ["out", 0.3, 1.7],
];

const LABELS = {
  1: "A water rig on a square board. A high tank on a stand (maker's plate ROLLIN) feeds a fill pipe through a round water meter, whose two-drum counter reads 04 cups, to the fill tap over a glass tank. A drain pipe of the same width leaves the tank through the drain tap and pours into a floor drain grate at the front edge. One handle at the left, linked by rods to both tap wheels, sits at its middle mark: both taps are half open, one blue stream falls into the tank and straight out into the grate, and the tank stays about 40 % full.",
  2: "A CMOS inverter on a board: VDD 1 V rail at the back, GND rail at the front, the input lever part way up at 0.5 V. The PMOS and NMOS gate bars are both lit, and a solid rust strap runs from VDD through the PMOS, the output node and the NMOS to GND. The output tank is half full and the lamp is dim.",
} as const;

// The one loop: plays the entrance, then the frozen frame with the water surfaces rippling (CSS runs the flow dashes).
export function ScLive({ panel, children }: { panel: 1 | 2; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const t = state.current.t;
    paintEntry(root, t, panel === 1 ? contacts : contacts2);
    const turn = (2 * Math.PI * 2 * loopTime(t, LOOP)) / LOOP;
    if (panel === 1) {
      for (const [b, amp, phase] of SLOSH) {
        const el = root.querySelector(`[data-box-water="${b}"]`);
        if (el) el.innerHTML = waterSvg(boxWater(b, amp, phase - turn));
      }
    } else {
      const el = root.querySelector(`[data-box-water="out2"]`);
      if (el) el.innerHTML = waterSvg(out2.water(0.2, 0.9 - turn));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="sc-stage">
      <Stage width={STAGE_W} height={panel === 1 ? STAGE_H : STAGE2_H} label={LABELS[panel]}>
        {panel === 2 ? (
          <defs>
            <BulbGlowDef id="sc-glow" />
          </defs>
        ) : null}
        {children}
      </Stage>
    </div>
  );
}
