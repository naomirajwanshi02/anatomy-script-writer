// Tri-state tank, chip-design episode 15 ("What is a tri-state buffer and why does a bus need it").
// Time unit: video seconds = voice seconds (video t = audio t; the voice starts with the 3 s entrance, as in episode 13).
// Word times: builds/notes/episodes/chip-design/15.words.json (53.3-57.2 timed by hand). Voice ends 68.42 s.
// LOOP = 68 s (3 s entrance + 68 = 71 s video); the fold back (62.14-63.6) restores the start state (pair 1 fill and
// pair 2 drain open, pair 3 shut, level half, rush, warning outline), which then holds to 71 s, so the loop ends as it starts.
// Analogy (0-28): one shared tank, three tap pairs (fill tap from the supply pipe, drain tap to the gutter), each with a
// lock lever and a level gauge. Fold (28.0-29.8): tank -> bus, supply pipe -> VDD, gutter -> GND, fill tap -> PMOS,
// drain tap -> NMOS, lock lever -> enable lever. Circuit (29.8-62.14). Fold back (62.14-63.6).
// The timeline holds only lever moves (EN), hand moves of the taps (D), folds and highlight beats. Everything else is
// computed: each driver's taps/switches (open toward D while EN = 1, both shut while EN = 0), the shared level (RC toward
// push / (push + pull)), the rush current push x pull / (push + pull), every flow streak, strap, outline, gauge, readout.
export const LOOP = 68;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";

export const W = {
  fight: 0.92, tank: 1.82, fills: 2.56, drains: 3.34, wins: 4.3, watch: 5.4,
  pairs: 6.52, thisTank: 7.4, fillTap: 8.8, drainTap: 9.56, gauge: 10.34,
  p1fills: 11.12, p2drains: 12.12, neither: 13.56, rushes: 14.54, sticks: 15.86, between: 16.38,
  lock: 18.42, both: 18.8, lock23: 19.92, alone: 21.54,
  oneWorks: 22.92, read: 24.48, ep: 26.46,
  now: 28.0, bits: 29.68,
  theTank: 30.38, wire: 31.24, bus: 32.3, full1: 32.92, empty0: 34.1,
  chip: 36.22, pushes: 36.7, pulls: 38.14,
  c1push: 39.58, c2pull: 40.56, current: 41.96, sits: 43.34, inBetween: 43.96,
  eachLock: 44.8, enable: 46.2, off: 47.34, bothSw: 47.88, disconnects: 49.4,
  three: 51.16, one: 52.34, zero: 52.76, or: 53.34, disc: 53.5,
  twoThree: 54.28, disconnect: 55.3, andRead: 56.01, clean: 57.26,
  tri: 58.24, push2: 60.08, pull2: 60.64, disc2: 61.2,
  here: 62.14,
};
const FOLD = [W.now, 29.8];
const FOLD_BACK = [W.here, 63.6];
export const KEY_TIME = 56.0; // key state: chip 1 drives a clean 1, chips 2 and 3 disconnected (Z)

// ---------- Drivers (pair i in the analogy = chip i in the circuit) ----------
// D: the tap hand (1 = fill / push, 0 = drain / pull, null = both taps closed by hand; analogy only).
// EN: the lock lever (1 = unlocked / enabled, lever up; 0 = locked / disabled, lever down).
type Ev = [number, number, "D" | "EN", 0 | 1 | null];
const EVENTS: Ev[] = [
  [W.watch, 0, "D", null], // "Let's watch": both open taps close by hand
  [W.watch, 1, "D", null],
  [W.p1fills, 0, "D", 1],
  [W.p2drains, 1, "D", 0],
  [W.lock23, 1, "EN", 0],
  [W.lock23 + 0.12, 2, "EN", 0],
  [28.9, 2, "D", 1], // mid fold, while locked: chip 3 holds D = 1
  [W.empty0, 0, "EN", 0], // circuit: chip 2 alone pulls the bus to 0
  [W.empty0, 1, "EN", 1],
  [W.chip, 1, "EN", 0],
  [W.chip, 0, "EN", 1],
  [W.c2pull, 1, "EN", 1], // both drive: fight
  [W.bothSw, 1, "EN", 0], // chip 2 disconnects
  [62.9, 1, "EN", 1], // fold back: the locks lift, the start frame returns
  [63.02, 2, "EN", 1],
  [62.9, 2, "D", null],
];
const D0: (0 | 1 | null)[] = [1, 0, null];
const EN0 = [1, 1, 1];
export const D_CIRCUIT = [1, 0, 1];

const LEVER_MOVE = 0.3; // s
const VALVE_TRAVEL = 0.25; // s, a tap or switch opens or shuts fully
const TAU_WATER = 1.0; // s, RC constant through one open tap
const TAU_CIRCUIT = 0.35; // s
const DT = 0.01;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
const pulse = (t: number, a: number, b: number, r = 0.2) => Math.min(ramp(t, a, r), 1 - ramp(t, b - r, r));

const valueAt = (i: number, f: "D" | "EN", t: number) => {
  let v: 0 | 1 | null = f === "D" ? D0[i] : (EN0[i] as 0 | 1);
  for (const [at, k, g, x] of EVENTS) if (k === i && g === f && t >= at) v = x;
  return v;
};
// Lever position 0 (down, locked) .. 1 (up, enabled), eased over LEVER_MOVE from each EN event.
const leverAt = (i: number, t: number) => {
  let p = EN0[i];
  for (const [at, k, g, x] of EVENTS) {
    if (k !== i || g !== "EN" || t < at) continue;
    p = p + ((x as number) - p) * ease((t - at) / LEVER_MOVE);
  }
  return p;
};

// Fold: 0 = tank, 1 = circuit.
const foldAt = (t: number) => (t < FOLD_BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, FOLD_BACK[0], FOLD_BACK[1] - FOLD_BACK[0]));

// ---------- Simulation (one pass over the whole video) ----------
// gp[i], gn[i]: how far pair i's fill tap (PMOS) and drain tap (NMOS) are open; level: shared tank / bus 0..1.
function simulate() {
  const n = Math.ceil(END / DT) + 2;
  const gp = [0, 1, 2].map((i) => [] as number[]);
  const gn = [0, 1, 2].map((i) => [] as number[]);
  const level: number[] = [];
  const g = { p: [1, 0, 0], n: [0, 1, 0] };
  let L = 0.5;
  for (let s = 0; s < n; s++) {
    const t = s * DT;
    let P = 0;
    let N = 0;
    for (let i = 0; i < 3; i++) {
      const en = valueAt(i, "EN", t);
      const d = valueAt(i, "D", t);
      const tp = en === 1 && d === 1 ? 1 : 0;
      const tn = en === 1 && d === 0 ? 1 : 0;
      const step = DT / VALVE_TRAVEL;
      g.p[i] = tp > g.p[i] ? Math.min(tp, g.p[i] + step) : Math.max(tp, g.p[i] - step);
      g.n[i] = tn > g.n[i] ? Math.min(tn, g.n[i] + step) : Math.max(tn, g.n[i] - step);
      gp[i].push(g.p[i]);
      gn[i].push(g.n[i]);
      P += g.p[i];
      N += g.n[i];
    }
    // RC toward push / (push + pull): fills through every open fill tap (1 - e^(-t/τ)), drains through every drain tap.
    const tau = foldAt(t) > 0.5 ? TAU_CIRCUIT : TAU_WATER;
    L = Math.min(1, Math.max(0, L + ((P * (1 - L) - N * L) / tau) * DT));
    level.push(L);
  }
  return { gp, gn, level };
}
const SIM = simulate();
const idx = (t: number) => Math.min(SIM.level.length - 1, Math.max(0, Math.round(t / DT)));

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

export function stateAt(time: number) {
  const t = vtOf(time);
  const k = idx(t);
  const fold = foldAt(t);
  const circuit = t >= FOLD[0] && t < FOLD_BACK[1];
  const level = SIM.level[k];
  const gp = SIM.gp.map((a) => a[k]);
  const gn = SIM.gn.map((a) => a[k]);
  const en = [0, 1, 2].map((i) => valueAt(i, "EN", t) as 0 | 1);
  const d = [0, 1, 2].map((i) => valueAt(i, "D", t));
  const lever = [0, 1, 2].map((i) => leverAt(i, t));
  const P = gp.reduce((a, b) => a + b, 0);
  const N = gn.reduce((a, b) => a + b, 0);
  const rush = P + N > 1e-6 ? (P * N) / (P + N) : 0;
  // Currents: into the tank / bus through each fill tap (PMOS), out through each drain tap (NMOS).
  const ip = gp.map((g) => g * (1 - level));
  const inn = gn.map((g) => g * level);
  // Header / bus segment j (right of driver j) carries everything pushed in minus pulled out at or left of j.
  const seg = [0, 1, 2].map((j) => ip.slice(0, j + 1).reduce((a, b) => a + b, 0) - inn.slice(0, j + 1).reduce((a, b) => a + b, 0));
  // Supply pipe segment j (left of driver j) feeds every fill tap at or right of j; gutter segment j drains those at or right of j.
  const supply = [0, 1, 2].map((j) => ip.slice(j).reduce((a, b) => a + b, 0));
  const gutter = [0, 1, 2].map((j) => inn.slice(j).reduce((a, b) => a + b, 0));
  const out = [0, 1, 2].map((i) => (en[i] ? String(fold > 0.5 ? D_CIRCUIT[i] : d[i] ?? "-") : "Z"));
  const busValue = level > 0.9 ? "1" : level < 0.1 ? "0" : "?";

  // Warning outlines: shown while the rush flows, from the beat that names it (start frame, "water rushes", "current rushes").
  const warnA = rush > 0.12 && (t < W.watch || (t >= W.rushes && t < W.now) || t >= FOLD_BACK[0] + 0.6);
  const warnC = rush > 0.12 && circuit && t >= W.current;

  // ----- Analogy beats -----
  const colLift = [0, 1, 2].map((i) => pulse(t, W.pairs + 0.3 * i, W.pairs + 0.3 * i + 0.55, 0.18));
  const analogy = {
    surge: pulse(t, W.fight, W.fight + 0.7, 0.2),
    fast: warnA,
    tankHl: inside(t, W.thisTank, W.thisTank + 0.9) || inside(t, W.tank, W.tank + 0.7),
    fillHl: inside(t, W.fillTap, W.fillTap + 0.7) || inside(t, W.fills, W.fills + 0.6),
    drainHl: inside(t, W.drainTap, W.drainTap + 0.7) || inside(t, W.drains, W.drains + 0.6),
    gaugeHl: [0, 1, 2].map((i) => inside(t, W.gauge, W.gauge + 0.8) || inside(t, W.between, W.between + 0.8) || (i > 0 && inside(t, W.read, W.read + 0.9))),
    leverHl: [0, 1, 2].map((i) => inside(t, W.lock, W.lock + 1.2) || (i === 0 && inside(t, W.oneWorks, W.oneWorks + 0.9))),
    colHl: [0, 1, 2].map((i) => i === 0 && inside(t, W.oneWorks, W.oneWorks + 0.9)),
    colLift,
  };

  // ----- Circuit beats -----
  // Chip 2's three-state demo: 1 (PMOS lit), 0 (NMOS lit), Z (both faint); a quick run, then one per spoken word.
  const demo: string | null = !circuit
    ? null
    : inside(t, W.three, W.three + 0.39) ? "1"
    : inside(t, W.three + 0.39, W.three + 0.78) ? "0"
    : inside(t, W.three + 0.78, W.one) ? "Z"
    : inside(t, W.one, W.zero) ? "1"
    : inside(t, W.zero, W.disc) ? "0"
    : null;
  const tagZ = [false, circuit && t >= W.disc, circuit && t >= W.twoThree];
  const tag = [null, demo ?? (tagZ[1] ? "Z" : null), tagZ[2] ? "Z" : null] as (string | null)[];
  const circ = {
    ghostTank: 0.6 * pulse(t, W.theTank, W.wire + 0.3, 0.3),
    busHl: inside(t, W.wire, W.wire + 0.7) || inside(t, W.bus, W.bus + 0.5),
    meterHl: inside(t, W.full1, W.full1 + 0.7) || inside(t, W.empty0, W.empty0 + 0.7) || inside(t, W.clean, W.clean + 0.8),
    chipHl: [0, 1, 2].map((i) => (i === 0 && (inside(t, W.chip, W.chip + 0.5) || inside(t, W.c1push, W.c1push + 0.6) || inside(t, W.tri, W.tri + 1.6))) || (i > 0 && inside(t, W.twoThree, W.twoThree + 0.8))),
    pHl: [0, 1, 2].map((i) => i === 0 && (inside(t, W.pushes, W.pushes + 0.6) || inside(t, W.push2, W.push2 + 0.5))),
    nHl: [0, 1, 2].map((i) => (i === 1 && inside(t, W.pulls, W.pulls + 0.6)) || (i === 0 && inside(t, W.pull2, W.pull2 + 0.5))),
    enHl: [0, 1, 2].map((i) => inside(t, W.enable, W.enable + 0.8) || (i === 0 && inside(t, W.tri, W.tri + 1.6))),
    ghostLock: 0.7 * pulse(t, W.eachLock, W.enable + 0.2, 0.25),
    // Gate bars: lit while the switch conducts; chip 2's demo shows each state on its own switches.
    gateP: [0, 1, 2].map((i) => (i === 1 && demo ? (demo === "1" ? 1 : 0) : gp[i])),
    gateN: [0, 1, 2].map((i) => (i === 1 && demo ? (demo === "0" ? 1 : 0) : gn[i])),
    // Output pin: lifts a hair off the bus while the chip is disconnected (follows its EN lever); chip 1's lift-and-drop
    // on "or disconnects" is a demo beat.
    pinLift: [0, 1, 2].map((i) => Math.max(1 - lever[i], i === 0 ? pulse(t, W.disc2, W.disc2 + 0.7, 0.2) : 0)),
    tag,
    readTicks: [false, circuit && t >= W.clean, circuit && t >= W.clean],
  };

  return {
    t,
    fold,
    circuit,
    level,
    gp,
    gn,
    en,
    d,
    lever,
    rush,
    ip,
    inn,
    seg,
    supply,
    gutter,
    out,
    busValue,
    warnA,
    warnC,
    analogy,
    circ,
  };
}
export type State = ReturnType<typeof stateAt>;

// The loop ends where it starts: the same taps open, the same level, the same rush.
{
  const a = stateAt(3);
  const b = stateAt(END - 0.01);
  if (Math.abs(a.level - b.level) > 0.01 || a.gp.some((g, i) => Math.abs(g - b.gp[i]) > 0.01) || a.gn.some((g, i) => Math.abs(g - b.gn[i]) > 0.01) || a.fold !== b.fold)
    throw new Error("tristate-tank: loop end does not match its start");
}
