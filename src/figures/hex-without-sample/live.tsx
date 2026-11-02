"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: plays the entrance; after it the scene is a frozen frame.
export function HexWithoutLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (root) paintEntry(root, state.current.t, contacts);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="hws-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Without hex: an engineer sits at a desk, seen from behind, facing a monitor whose blue screen is a dense wall of 0s and 1s; a thought bubble above his head holds tangled, crossed-out bits, one misread digit and a big question mark."
      >
        <defs>
          <radialGradient id="hws-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.3" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.13" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hws-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
