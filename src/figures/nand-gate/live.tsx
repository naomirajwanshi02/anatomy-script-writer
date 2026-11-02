"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { paintEntry } from "../../iso/react/reel";
import { approach, useFrameLoop, useInView } from "../../iso/react/live";
import { BulbGlowDef } from "../../iso/react/bulb";
import { Stage } from "../../iso/react/draw";
import { contacts, knobAt, knobTransform, leverAt, rodPath, STAGE_H, STAGE_W } from "./geometry";
import { KEY_TIME, nand, rowAt, ROWS } from "./model";

export function TruthTable() {
  return (
    <table className="gate-table" aria-label="NAND truth table">
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
          <th>Y</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([a, b], i) => {
          const y = +nand(a, b);
          return (
            <tr key={i}>
              <td>{+a}</td>
              <td>{+b}</td>
              <td data-out={y}>{y}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// The one loop: writes lever, wire, bulb and table-row states into the static art.
export function GateLive({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const state = useRef({ t: 0, row: -1, lamp: 1, lever: { a: 1, b: 1 } });

  const paint = (dt: number, reduced: boolean) => {
    const root = ref.current;
    if (!root) return;
    const s = state.current;
    paintEntry(root, s.t, contacts);
    const row = rowAt(s.t);
    const [a, b] = ROWS[row];
    const y = nand(a, b);
    for (const [k, v] of [["a", a], ["b", b]] as const) {
      s.lever[k] = approach(s.lever[k], v ? -1 : 1, dt, 0.07, reduced);
      const lv = root.querySelector(`[data-lever="${k}"]`);
      lv?.querySelector("[data-rod]")?.setAttribute("d", rodPath(leverAt[k], s.lever[k]));
      lv?.querySelector("[data-knob]")?.setAttribute("transform", knobTransform(knobAt(leverAt[k], s.lever[k])));
    }
    if (row !== s.row) {
      s.row = row;
      const on = { a, b, y };
      for (const k of ["a", "b", "y"] as const) {
        const v = on[k] ? "1" : "0";
        root.querySelector(`[data-wire="${k}"]`)?.setAttribute("data-on", v);
      }
      root
        .closest("[data-figure]")
        ?.querySelectorAll(".gate-table tbody tr")
        .forEach((tr, i) => tr.toggleAttribute("data-now", i === row));
    }
    s.lamp = approach(s.lamp, y ? 1 : 0, dt, 0.12, reduced);
    (root.querySelector('[data-led="y"]') as HTMLElement | null)?.style.setProperty("--lamp", s.lamp.toFixed(3));
    const glow = root.querySelector(".gate-glow") as HTMLElement | null;
    if (glow) glow.style.opacity = s.lamp.toFixed(3);
  };

  useFrameLoop((dt, reduced) => {
    state.current.t = reduced ? KEY_TIME : state.current.t + dt;
    paint(dt, reduced);
    return !reduced;
  }, inView);
  useEffect(() => paint(0, true), []);

  return (
    <div ref={ref} className="gate-stage">
      <Stage
        width={STAGE_W}
        height={STAGE_H}
        label="A NAND gate block on a small board. Inputs A and B enter on the left, output Y leaves on the right to a lamp. It steps through the inputs 00, 01, 10, 11; Y is 1, and its lamp lit, in every row except 11."
      >
        <defs>
          <BulbGlowDef id="gate-glow" />
        </defs>
        {children}
      </Stage>
    </div>
  );
}
