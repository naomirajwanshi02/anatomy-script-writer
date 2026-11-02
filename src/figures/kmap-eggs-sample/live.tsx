"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: plays the entrance; after it the scene is a frozen frame.
export function KeLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="ke-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A 2 by 4 egg carton on a square board as a 3-variable K-map: rows A 0 and 1, columns BC 00 01 11 10; brown eggs fill the right 2 by 2 block, wrapped by one rust band; the lid lies folded open behind with a ROLLIN print."
      >
        <defs>
          {/* Brown egg shell: highlight upper left, shade lower right. */}
          <radialGradient id="ke-shell" cx="0.34" cy="0.28" r="0.85">
            <stop offset="0" stopColor="#f1e5cb" />
            <stop offset="0.4" stopColor="#d9c5a0" />
            <stop offset="1" stopColor="#b9a47f" />
          </radialGradient>
          {/* Cone post: lit left flank, shaded right flank. */}
          <linearGradient id="ke-post" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f1e5cb" />
            <stop offset="0.55" stopColor="#eadbbd" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {/* Cup bulge: lit left (front) flank, shaded right flank, a soft round sheen. */}
          <linearGradient id="ke-bump" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#eadbbd" />
            <stop offset="0.3" stopColor="#f1e5cb" />
            <stop offset="0.7" stopColor="#eadbbd" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {/* Pulp speckle: tiny low-contrast dots. */}
          <pattern id="ke-speck" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="0.8" cy="1.1" r="0.28" fill="#8a7356" />
            <circle cx="3.4" cy="0.6" r="0.22" fill="#8a7356" />
            <circle cx="2.2" cy="3.1" r="0.3" fill="#8a7356" />
            <circle cx="4.3" cy="4.0" r="0.2" fill="#8a7356" />
          </pattern>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
