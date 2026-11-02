"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// Lamp colours: red (warning hue), yellow (lit-lamp hue), signal teal for green (approved for this episode).
const LIT = { red: "#c2402f", yellow: "#ffc21a", green: "#1f9e8f" };

// The one loop: plays the entrance; after it the scene is a frozen frame.
export function DtLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="dt-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A traffic light on a short pole standing on the left of a square board: dark housing with red, yellow and green lamps under visors; the green lamp is lit and casts a glow on the board; a ROLLIN maker's plate on the plinth; open board space to the right."
      >
        <defs>
          {/* Off lens: dark sepia glass, slightly lighter at the upper left. */}
          <radialGradient id="dt-off" cx="0.38" cy="0.34" r="0.8">
            <stop offset="0" stopColor="#5a4630" />
            <stop offset="0.6" stopColor="#3b2a1a" />
            <stop offset="1" stopColor="#1e140a" />
          </radialGradient>
          {(Object.keys(LIT) as (keyof typeof LIT)[]).map((k) => (
            <g key={k}>
              {/* Lit lens: near-white core, full hue at the rim. */}
              <radialGradient id={`dt-lit-${k}`} cx="0.45" cy="0.42" r="0.7">
                <stop offset="0" stopColor="#fffdf2" />
                <stop offset="0.35" stopColor={LIT[k]} stopOpacity="0.75" />
                <stop offset="1" stopColor={LIT[k]} />
              </radialGradient>
              {/* Glow pool on the board: pale core, then the hue fading out (normal blending). */}
              <radialGradient id={`dt-pool-${k}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#fffdf2" stopOpacity="0.55" />
                <stop offset="0.35" stopColor={LIT[k]} stopOpacity="0.22" />
                <stop offset="1" stopColor={LIT[k]} stopOpacity="0" />
              </radialGradient>
            </g>
          ))}
          <filter id="dt-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {children}
      </Stage>
    </div>
  );
}
