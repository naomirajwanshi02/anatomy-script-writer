"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BulbGlowDef } from "../../iso/react/bulb";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// The one loop: plays the entrance; after it the scene is a frozen frame (states are set in the static art).
export function DiLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="di-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A two-wing apartment building on a board, wings A and B, two floors, two flats per floor in each wing: eight doors, each with a glass-bulb doorbell and a plate of three check dots W, F, S. Three address wires run from the guard's intercom panel (levers WING at B, FLOOR at G, SIDE at R) up the facade and straight through every plate's dots. A dot is filled where that lever matches the flat; only flat B, ground floor, right has all three filled, and only its bell glows and rings."
      >
        <defs>
          <BulbGlowDef id="di-glow" />
          <BulbGlowDef id="di-pool" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
