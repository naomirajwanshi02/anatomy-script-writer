"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";
import { LOOP } from "./model";

// The one loop: the entrance plays, then the frame holds (a still sample, nothing else moves).
export function CsLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0 });

  const paint = () => {
    const root = ref.current;
    if (root) paintEntry(root, state.current.t, contacts);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? 3 + LOOP : state.current.t + dt;
    paint();
    return !reduced && state.current.t < 3 + LOOP;
  }, inView);
  useEffect(() => paint(), []);

  return (
    <div ref={ref} className="cs-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A two-lane road on a board. Five supercars numbered 1 to 5 drive in a line in the upper lane: rust, light rust, dark brown, mid brown and cream. A small dog runs across the road just in front of car 1, which is caught mid-swerve. A roadside sign reads ROLLIN."
      >
        {children}
      </Stage>
    </div>
  );
}
