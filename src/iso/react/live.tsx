"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const MARGIN = "120px 0px";
const MAX_DT = 1 / 30;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia(REDUCED).matches;

export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(false);
  const watched = useRef<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (el === watched.current) return;
    observer.current?.disconnect();
    observer.current = null;
    watched.current = el;
    setInView(false);
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (watched.current === el && observer.current === io) setInView(!!entries.at(-1)?.isIntersecting);
      },
      { rootMargin: MARGIN },
    );
    observer.current = io;
    io.observe(el);
  });
  useEffect(
    () => () => {
      observer.current?.disconnect();
      observer.current = null;
      watched.current = null;
    },
    [],
  );
  return inView;
}

export function InView({ className, children }: { className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={className} data-inview={inView ? "" : undefined}>
      {children}
    </div>
  );
}

type Tick = (dt: number, reduced: boolean) => boolean;

// Capture contract (builds/capture.mjs): with ?capture there is no real-time clock. Transitions are off and
// window.__isoStep(dt, at) runs every registered tick with dt, then parks every CSS animation at `at` seconds.
const CAPTURE = typeof location !== "undefined" && new URLSearchParams(location.search).has("capture");
const ticks = new Set<{ current: Tick }>();
if (CAPTURE) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  (window as unknown as { __isoStep: (dt: number, at: number) => void }).__isoStep = (dt, at) => {
    ticks.forEach((t) => t.current(dt, false));
    document.getAnimations().forEach((a) => {
      a.pause();
      a.currentTime = at * 1e3;
    });
  };
}

// Runs tick(dt, reduced) on requestAnimationFrame while active and while tick returns true (dt capped at 1/30 s).
export function useFrameLoop(tick: Tick, active: boolean) {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  const frame = useRef(0);
  const last = useRef(0);
  useEffect(() => {
    if (CAPTURE) {
      ticks.add(tickRef);
      return () => void ticks.delete(tickRef);
    }
  }, []);
  const start = useCallback(() => {
    if (CAPTURE || frame.current) return;
    last.current = 0;
    const step = (now: number) => {
      const dt = last.current ? Math.min((now - last.current) / 1e3, MAX_DT) : 1 / 60;
      last.current = now;
      const more = tickRef.current(dt, reducedMotion());
      frame.current = more ? requestAnimationFrame(step) : 0;
    };
    frame.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => {
    if (active) start();
    else {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [active, start]);
  return start;
}

// Exponential approach of `from` toward `to` with time constant tau; snaps when close or when `snap` is set.
export function approach(from: number, to: number, dt: number, tau: number, snap = false): number {
  if (snap) return to;
  const v = from + (to - from) * (1 - Math.exp(-dt / tau));
  return Math.abs(to - v) < 1e-3 ? to : v;
}
