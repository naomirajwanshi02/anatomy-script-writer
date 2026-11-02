"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { useFrameLoop, useInView } from "../../iso/react/live";
import { Stage } from "../../iso/react/draw";
import { contacts, STAGE_H, STAGE_W } from "./geometry";

// Shading materials: four sepia tones, light from the upper left (highlight, base, shade, deep).
const MATS: Record<string, [string, string, string, string]> = {
  skin: ["#fff8ea", "#fbf3e2", "#f1e5cb", "#e2d0ad"],
  hair: ["#8a7356", "#5a4630", "#3b2a1a", "#2a1d10"],
  "hair-light": ["#d8c8a6", "#b9a47f", "#8a7356", "#5a4630"],
  shirt: ["#fff8ea", "#fbf3e2", "#eadbbd", "#d9c5a0"],
  cuff: ["#fff8ea", "#fbf3e2", "#f1e5cb", "#e2d0ad"],
  hoodie: ["#d8c8a6", "#b9a47f", "#8a7356", "#5a4630"],
  "rib-dark": ["#b9a47f", "#8a7356", "#8a7356", "#5a4630"],
  cardigan: ["#e2d0ad", "#d9c5a0", "#b9a47f", "#8a7356"],
  rib: ["#d9c5a0", "#b9a47f", "#b9a47f", "#8a7356"],
  top: ["#fff8ea", "#fbf3e2", "#f1e5cb", "#eadbbd"],
  shirtd: ["#f1e5cb", "#eadbbd", "#d9c5a0", "#b9a47f"],
  roll: ["#fbf3e2", "#f1e5cb", "#eadbbd", "#d9c5a0"],
  trousers: ["#8a7356", "#5a4630", "#3b2a1a", "#2a1d10"],
  jeans: ["#b9a47f", "#8a7356", "#5a4630", "#3b2a1a"],
  shoe: ["#5a4630", "#3b2a1a", "#2a1d10", "#1e140a"],
  dark: ["#5a4630", "#3b2a1a", "#2a1d10", "#1e140a"],
  pad: ["#8a7356", "#5a4630", "#5a4630", "#3b2a1a"],
  mouse: ["#fbf3e2", "#f1e5cb", "#e2d0ad", "#d9c5a0"],
  metal: ["#b9a47f", "#8a7356", "#5a4630", "#3b2a1a"],
  chair: ["#8a7356", "#5a4630", "#3b2a1a", "#2a1d10"],
  "chair-pad": ["#b9a47f", "#8a7356", "#5a4630", "#3b2a1a"],
};

// The one loop: plays the entrance; after it the page is a frozen frame.
export function EngineerStylesLive({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="es-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="Engineer styles tester: four desk scenes in a 2 by 2 grid, each with a monitor showing a blue wall of bits, a keyboard, an office chair and a seated engineer seen from behind; A collared shirt typing, B hoodie and headphones hunched forward, C ponytail and cardigan with one hand on the mouse, D rolled sleeves and glasses leaning back with a hand on the chin."
      >
        <defs>
          <radialGradient id="es-blue-pool">
            <stop offset="0" stopColor="#2f6fb8" stopOpacity="0.3" />
            <stop offset="0.55" stopColor="#2f6fb8" stopOpacity="0.13" />
            <stop offset="1" stopColor="#2f6fb8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="es-lcd-glass" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#d6e5f3" />
            <stop offset="1" stopColor="#bcd3ec" />
          </linearGradient>
          {Object.entries(MATS).map(([id, c]) => (
            <linearGradient key={id} id={`es-g-${id}`} x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0" stopColor={c[0]} />
              <stop offset="0.3" stopColor={c[1]} />
              <stop offset="0.68" stopColor={c[2]} />
              <stop offset="1" stopColor={c[3]} />
            </linearGradient>
          ))}
        </defs>
        {children}
      </Stage>
    </div>
  );
}
