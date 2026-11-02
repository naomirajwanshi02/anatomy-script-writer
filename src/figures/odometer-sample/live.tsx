"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: only the entrance moves; the scene is frozen from loop start.
export function OdoLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const t = useRef(0);
  const paint = () => ref.current && paintEntry(ref.current, t.current, contacts);

  useFrameLoop((dt, reduced) => {
    t.current = reduced ? 10 : t.current + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => void paint(), []);

  return (
    <div ref={ref} className="odo-stage">
      <Stage width={STAGE_W} height={STAGE_H} label="A car instrument cluster on a square board: tachometer and speedometer, odometer drums at 9999 inside the speedometer, four lit warning lights between the gauges; a callout shows 9999 on a blue LCD inside a red dashed box.">
        <defs>
          <radialGradient id="odo-warm-pool">
            <stop offset="0" stopColor="#fff6c8" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#ffc21a" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffc21a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="odo-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
          <linearGradient id="odo-drum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9c5a0" />
            <stop offset="0.5" stopColor="#fff8ea" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          <linearGradient id="odo-drum-shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2a1a" stopOpacity="0.75" />
            <stop offset="0.3" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="0.7" stopColor="#3b2a1a" stopOpacity="0" />
            <stop offset="1" stopColor="#3b2a1a" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="odo-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff8ea" />
            <stop offset="0.3" stopColor="#b9a47f" />
            <stop offset="0.5" stopColor="#fbf3e2" />
            <stop offset="0.75" stopColor="#8a7356" />
            <stop offset="1" stopColor="#d9c5a0" />
          </linearGradient>
          {[
            ["odo-glow-y", "#ffc21a"],
            ["odo-glow-r", "#c2402f"],
            ["odo-glow-b", "#2f6fb8"],
          ].map(([id, c]) => (
            <radialGradient key={id} id={id}>
              <stop offset="0" stopColor={c} stopOpacity="0.7" />
              <stop offset="0.5" stopColor={c} stopOpacity="0.25" />
              <stop offset="1" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {children}
      </Stage>
    </div>
  );
}
