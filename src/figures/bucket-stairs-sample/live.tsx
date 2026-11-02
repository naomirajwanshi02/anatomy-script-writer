"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: plays the entrance, then holds the frozen start frame.
export function BsLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    paintEntry(root, state.current.t, contacts);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="bs-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A square board. Left, a four-floor building with a window band per floor, a flat roof, a door with a ROLLIN name plate, and an outside staircase zig-zagging up its front with a landing at each floor. Touching its right wall, an empty clear glass tank as tall as the building with marks 1 to 4, a spout from the roof over its rim and a closed drain tap at its foot. At the foot of the stairs, Sam faces the stairs beside a row of four buckets of blue water."
      >
        {children}
      </Stage>
    </div>
  );
}
