"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";
import { LAMP } from "./model";

// The one loop: plays the entrance; after it the scene is a frozen frame (LED brightness from the model).
export function DfLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (!root) return;
    paintEntry(root, state.current.t, contacts);
    root.querySelectorAll<SVGGElement>("[data-lamp]").forEach((el) => el.style.setProperty("--lamp", LAMP.toFixed(3)));
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 : state.current.t + dt;
    paint();
    return !reduced;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="df-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A French-door fridge on a square board: the left door swung open, the right door closed with a ROLLIN badge; white LED strips light the inside and the light spills onto the board."
      >
        <defs>
          {/* White LED light: pool on the board and inside glow, plus washes on the inner faces (bright end first). */}
          <radialGradient id="df-glow">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.7" />
            <stop offset="0.45" stopColor="#fffdf2" stopOpacity="0.38" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="df-wash-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-t" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="df-wash-b" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fffdf2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff8ea" stopOpacity="0" />
          </linearGradient>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
