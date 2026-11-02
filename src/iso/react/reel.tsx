import type { ReactNode } from "react";
import { entryState, sparkAt, SPARKS_PER_POINT } from "../entrance";
import "../reel.css";

// Full 9:16 frame: the board at 95 % of the frame width, readouts below it.
export function ReelScreen({ className, readout, children }: { className: string; readout?: ReactNode; children: ReactNode }) {
  return (
    <div className={`iso ${className} reel`} data-theme="sepia" data-figure="">
      <div className="reel-centre">
        {children}
        {readout ? <div className="reel-below">{readout}</div> : null}
      </div>
    </div>
  );
}

export const Sparks = ({ points }: { points: number }) => (
  <g data-sparks="">
    {Array.from({ length: points * SPARKS_PER_POINT }, (_, i) => (
      <line key={i} className="reel-spark" data-spark={i} x1="0" y1="0" x2="0" y2="0" opacity="0" />
    ))}
  </g>
);

// Paints the entrance at time t: shake on [data-entry], rise on [data-base], fall on [data-parts], sparks, readout slide.
export function paintEntry(root: Element, t: number, contacts: [number, number][]) {
  const s = entryState(t);
  root.querySelector("[data-entry]")?.setAttribute("transform", `translate(${s.shake.x.toFixed(2)} ${s.shake.y.toFixed(2)})`);
  root.querySelector("[data-base]")?.setAttribute("transform", `translate(0 ${s.base.toFixed(2)})`);
  root.querySelector("[data-parts]")?.setAttribute("transform", `translate(0 ${s.parts.toFixed(2)})`);
  root.querySelectorAll("[data-spark]").forEach((el, i) => {
    const p = sparkAt(t, contacts[Math.floor(i / SPARKS_PER_POINT) % contacts.length], i);
    if (!p) return void el.setAttribute("opacity", "0");
    el.setAttribute("x1", p.tail[0].toFixed(1));
    el.setAttribute("y1", p.tail[1].toFixed(1));
    el.setAttribute("x2", p.head[0].toFixed(1));
    el.setAttribute("y2", p.head[1].toFixed(1));
    el.setAttribute("opacity", p.opacity.toFixed(2));
    el.setAttribute("data-hot", p.hot ? "1" : "0");
  });
  (root.closest("[data-figure]") as HTMLElement | null)?.style.setProperty("--readout-in", s.readout.toFixed(3));
}
