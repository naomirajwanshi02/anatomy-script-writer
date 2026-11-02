// Taps world model helpers: an episode's model.ts keeps its own time unit, timeline and numbers and builds its state
// with these, so the water rig, the circuit and the readouts all read one simulation (CLAUDE.md section 6).
// Handle (water) = input lever (circuit) = Vin / VDD (0..1). The fill tap is the PMOS, the drain tap the NMOS, the glass
// tank the output node (load C).

// ---------- Helpers ----------
const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
export const lin = (t: number, a: number, d: number) => (d <= 0 ? (t >= a ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / d)));
export const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));
export const inside = (t: number, a: number, b: number) => t >= a && t < b;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Fade in at a over f, out at b over f (0..1 inside [a, b)).
export const window01 = (t: number, a: number, b: number, f = 0.3) => (inside(t, a, b) ? Math.min(ramp(t, a, f), 1 - ramp(t, b - f, f)) : 0);
// Loop clock: frames after END show the loop again from 3 s.
export const loopClock = (loop: number) => (t: number) => (t < 3 + loop ? t : 3 + ((t - 3) % loop));

// ---------- Inverter (square-law through-current, linear tap openings) ----------
export function inverter({ vdd = 1, vtn = 0.3, vtp = 0.7, k = 25 }: { vdd?: number; vtn?: number; vtp?: number; k?: number } = {}) {
  const current = (v: number) => (v > vtn && v < vtp ? k * Math.min((v - vtn) ** 2, (vtp - v) ** 2) : 0);
  const meanI = (() => {
    let s = 0;
    const n = 4000;
    for (let i = 0; i < n; i++) s += current((i + 0.5) / n);
    return s / n;
  })();
  return {
    VDD: vdd,
    VTN: vtn,
    VTP: vtp,
    current,
    I_PEAK: current((vtn + vtp) / 2),
    pOpen: (v: number) => Math.min(1, Math.max(0, (vtp - v) / vtp)), // top tap / PMOS opening
    nOpen: (v: number) => Math.min(1, Math.max(0, (v - vtn) / (1 - vtn))), // bottom tap / NMOS opening
    meanI, // mean of I over one linear 0..1 V edge
  };
}
export type Inverter = ReturnType<typeof inverter>;

// ---------- Handle timeline ----------
// Moves: [start, duration, target, linear?]. Edges that are measured are linear, the rest eased.
export type Move = [number, number, number, boolean];
export function handleTrack(moves: Move[], h0 = 0.5) {
  return (t: number) => {
    let h = h0;
    for (const [a, d, v, isLin] of moves) {
      if (t < a) break;
      const p = h;
      h = p + (v - p) * (isLin ? lin(t, a, d) : ramp(t, a, d));
    }
    return h;
  };
}
// Slow-motion replay: knots [video t, story t]; returns story time for a video time inside the replay.
export function replayClock(knots: [number, number][]) {
  return (t: number) => {
    for (let i = 1; i < knots.length; i++) {
      const [a, sa] = knots[i - 1];
      const [b, sb] = knots[i];
      if (t < b) return sa + ((sb - sa) * Math.max(0, t - a)) / (b - a);
    }
    return knots[knots.length - 1][1];
  };
}

// ---------- Folds ----------
// Parts travel one every `step` s, each over `dur` s; the fold back runs at 0.6 x step. The lamp goes at slot lampK.
export const FOLD_KEYS = ["supply", "grate", "taps", "handle", "tank", "meter"] as const;
export type FoldPart = (typeof FOLD_KEYS)[number] | "lamp";
export function foldClock({ fold, back, step = 0.3, dur = 0.6, lampK = 5.3 }: { fold: [number, number]; back: [number, number]; step?: number; dur?: number; lampK?: number }) {
  // 0 = water part, 1 = circuit part (travel progress).
  const foldAt = (part: FoldPart, t: number) => {
    const k = part === "lamp" ? lampK : FOLD_KEYS.indexOf(part);
    if (t < back[0]) return ramp(t, fold[0] + k * step, dur);
    return 1 - ramp(t, back[0] + (part === "lamp" ? 0 : k) * step * 0.6, dur);
  };
  const morphAt = (t: number) => (t < back[0] ? ramp(t, fold[0], fold[1] - fold[0]) : 1 - ramp(t, back[0], back[1] - back[0]));
  const folds = (t: number) => Object.fromEntries([...FOLD_KEYS, "lamp"].map((p) => [p, foldAt(p as FoldPart, t)])) as Record<FoldPart, number>;
  return { foldAt, morphAt, folds };
}

// ---------- The one simulation ----------
// Tank: dL/dt = (P x (1 - L) - N x L) / tau (symmetric: half full at the middle mark). Energy E = integral of VDD x I dt
// in units of eUnit. A replay (optional) rewinds the state to its story start and re-runs it at the replay's rate.
export function simulate({
  end,
  dev,
  hAt,
  tauAt,
  eUnit,
  L0 = 0.5,
  dt = 0.005,
  replay,
}: {
  end: number;
  dev: Inverter;
  hAt: (t: number) => number;
  tauAt: (t: number) => number;
  eUnit: number;
  L0?: number;
  dt?: number;
  replay?: { from: number; to: number; story: number; storyOf: (t: number) => number };
}) {
  const rows: { L: number; E: number }[] = [];
  let L = L0;
  let E = 0;
  let snap = { L, E };
  for (let k = 0; ; k++) {
    const t = k * dt;
    if (t > end + 0.05) break;
    if (replay && Math.abs(t - replay.story) < dt / 2) snap = { L, E };
    if (replay && Math.abs(t - replay.from) < dt / 2) ({ L, E } = snap);
    rows.push({ L, E });
    const v = hAt(t + dt / 2);
    const ds = replay && inside(t, replay.from, replay.to) ? replay.storyOf(t + dt) - replay.storyOf(t) : dt;
    L = clamp01(L + ((dev.pOpen(v) * (1 - L) - dev.nOpen(v) * L) * ds) / tauAt(t));
    E += (dev.VDD * dev.current(v) * ds) / eUnit;
  }
  const at = (t: number) => rows[Math.min(rows.length - 1, Math.max(0, Math.round(t / dt)))];
  return { levelAt: (t: number) => at(t).L, eAt: (t: number) => at(t).E };
}

// ---------- What the kit's live loop paints ----------
// Required: positions and flows. Beats (rings, flashes, glows) are optional and default to 0.
export type TapsState = {
  t: number;
  h: number; // handle / lever (0..1)
  L: number; // tank level (0..1)
  m: number; // board morph (0 square, 1 long)
  P: number; // fill tap / PMOS opening
  N: number; // drain tap / NMOS opening
  I: number; // through-current
  iN: number; // through-current / peak (0..1)
  fillFlow: number;
  drainFlow: number;
  fold: Record<FoldPart, number>;
  cups?: number; // meter counter (two drums)
  bothFlash?: number;
  handlePulse?: number;
  rodGlow?: number;
  fillTapPulse?: number;
  tankGlint?: number;
  drainTapPulse?: number;
  meterPulse?: number;
  slowmo?: number;
  throughGlow?: number;
  gratePulse?: number;
  drip?: number; // drop from the drain tap (0..1), -1 none
  leverPulse?: number;
  outPulse?: number;
  pFlash?: number;
  vddPulse?: number;
  nFlash?: number;
  gndPulse?: number;
  vinRowPulse?: number;
  labelFlash?: Partial<Record<"vdd" | "gnd" | "pn" | "vin", number>>;
  ghost?: number; // ghost water handle opacity (0..1)
  ghostH?: number; // its position
  // Readout.
  readA?: number;
  graph?: TapsGraphState;
  counter?: TapsCounterState;
};
// Two-row graph (Vin on top, I from VDD below): window index (-1 = empty), shaded areas, edge labels.
export type TapsGraphState = {
  w: number;
  iRowA: number;
  bandLit: boolean;
  areas: { t0: number; t1: number; active: boolean; pulse: number }[];
  edges: { on: boolean; x: number }[]; // x in graph units
};
// Counter rows: value and state (off = not yet, on = counting (rust), done = final (ink)).
export type TapsCounterState = { a: number; rows: { value: number; state: "off" | "on" | "done" }[] };
