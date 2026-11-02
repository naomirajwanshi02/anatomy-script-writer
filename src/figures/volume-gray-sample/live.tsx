"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: plays the entrance; after it the scene is a frozen frame.
export function VgLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="vg-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A hi-fi amplifier on a square board, its volume knob between 3 and 4, its blue display reading VOL 7; a speaker beside it blasts rust sound arcs and a callout plate repeats VOL 7 inside a red dashed warning outline."
      >
        <defs>
          <radialGradient id="vg-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.35" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.16" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vg-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
