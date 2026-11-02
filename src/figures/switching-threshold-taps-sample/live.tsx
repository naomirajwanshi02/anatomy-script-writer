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
  ["supply", 0.35, 0],
  ["out", 0.25, 1.7],
  ["basin", 0.35, 3.1],
];

// The one loop: plays the entrance, then the frozen frame with the water surfaces rippling under the streams.
export function StLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="st-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A water rig on a board. A high supply tank on a stand (maker's plate ROLLIN) feeds a narrow fill pipe through the fill tap into a glass output tank with a half mark. A drain pipe two and a half times wider leaves the tank through the drain tap into a drain basin. One handle at the left, linked by rods to both tap wheels, sits at its middle mark: both taps are half open and both streams run, the fill stream thinner, and the output tank stays almost empty, far below its half mark."
      >
        {children}
      </Stage>
    </div>
  );
}
