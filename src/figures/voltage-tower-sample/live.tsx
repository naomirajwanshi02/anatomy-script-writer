"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { loopTime } from "../../iso/entrance";
import { waterSvg } from "../../iso/analogy/water";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { boxWater, contacts, STAGE_H, STAGE_W, type Box } from "./geometry";
import { LOOP } from "./model";

// Ripple: phases advance a whole number of turns per loop, so the last frame matches the first.
const SLOSH: [Box, number, number][] = [
  ["trough", 0.3, 0],
  ["sump", 0.25, 2.1],
];

// The one loop: plays the entrance, then the frozen frame with the tower and sump water rippling gently.
export function VtLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    const t = state.current.t;
    paintEntry(root, t, contacts);
    const turn = (2 * Math.PI * 2 * loopTime(t, LOOP)) / LOOP;
    for (const [b, amp, phase] of SLOSH) {
      const el = root.querySelector(`[data-box-water="${b}"]`);
      if (el) el.innerHTML = waterSvg(boxWater(b, amp, phase - turn));
    }
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="vt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A water rig on a square board. Back left, a water tower: an open trough of blue water on a telescopic stand with height marks 1 to 4, raised to mark 4, maker's plate ROLLIN on its plinth. Front left, a sump basin of blue water with a pump box; a riser pipe climbs from the pump and pours into the trough. Right, an empty glass tank with marks 1 to 4: a top pipe and closed tap from the tower feed its top, a bottom closed tap and drain pipe run back to the sump. Front right, a clock dial with one hand at twelve."
      >
        {children}
      </Stage>
    </div>
  );
}
