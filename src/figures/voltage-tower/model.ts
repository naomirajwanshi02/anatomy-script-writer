// Lowering supply voltage as a water tower, chip-design episode 17 ("Why does lowering supply voltage save so much power").
// Time unit: video seconds (the 3 s entrance + the figure loop; brief times in builds/notes/episodes/chip-design/17.page.md
// are planned video seconds). LOOP = 70.7 s, so the video is 73.7 s; the hook preview runs inside the entrance and is
// reset by 2.9 s, and the start frame (tower at mark 4, tank empty, taps shut, clock at 12) is back by 69.0 s and held to
// the end, so the loop ends in its start state.
// Analogy (0-31.8): tower height = supply voltage, top tap = PMOS, bottom tap = NMOS, glass tank level = output.
// Fold at "Now," (31.8-33.8): tower + pump -> VDD rail, sump -> GND rail, taps -> valves, clock -> input lever.
// Circuit (33.8-64.7). Fold back (64.7-66.3).
// Timeline (below): tower height moves, tap moves (analogy), input lever moves (circuit), clock ticks, fold and beat
// times. Everything else is computed: the tank level follows dL/dt = (top x (H - L) - bottom x L) / tau, so it fills on
// 1 - e^(-t/tau) toward the tower (rail) level and drains on e^(-t/tau); in the circuit the valves follow the lever with
// break-before-make (the conducting valve lets go before the other turns on); charge = C x V, energy per fill =
// charge x V = C x V x V -> 16 units at 1.0 V, 4 at 0.5 V (ratio 0.25); straps, streams, tags and readout read these.
export const LOOP = 70.7;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";
export const MARKS = 4;

// ---------- Energy (C = 1 per full tank) ----------
export const C = 1;
export const charge = (v: number) => C * v;
export const energy = (v: number) => charge(v) * v;
export const UNITS = 16; // squares for a full fill at 1.0 V
export const ENERGY_FULL = UNITS * energy(1); // 16
export const ENERGY_HALF = UNITS * energy(0.5); // 4
export const RATIO = ENERGY_HALF / ENERGY_FULL; // 0.25
// Readout block for a fill at voltage v: columns = charge (quarters), rows = voltage (quarters).
export const blockOf = (v: number) => ({ cols: Math.round(MARKS * charge(v)), rows: Math.round(MARKS * v) });

// ---------- Timeline ----------
export const FOLD = [31.8, 33.8];
export const BACK = [64.7, 66.3];
export const KEY_TIME = 58;

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));
const bumps = (t: number, list: number[], d: number) => Math.max(0, ...list.map((a) => bump(t, a, d)));

export const morphAt = (t: number) => (t < BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, BACK[0], BACK[1] - BACK[0]));

// Tower (supply) height as a fraction of 4 marks: [time, target, duration]. 1 = mark 4 = 1.0 V.
const H_MOVES: [number, number, number][] = [
  [1.3, 0.5, 0.4], // hook: "height"
  [2.5, 1, 0.4], // hook reset
  [17.9, 0.5, 0.8], // "Halve the tower"
  [30.0, 1, 0.8], // back to mark 4
  [53.3, 0.5, 0.6], // "Halve the voltage"
  [64.9, 1, 1.2], // fold back: the stand rises
];
const moveTo = (t: number, moves: [number, number, number][], start: number) => {
  let v = start;
  for (const [a, x, d] of moves) {
    if (t < a) break;
    v += (x - v) * ease((t - a) / d);
  }
  return v;
};
export const heightAt = (t: number) => moveTo(t, H_MOVES, 1);

// Analogy taps: [time, top open, bottom open, duration].
const TAPS: [number, number, number, number][] = [
  [1.5, 1, 0, 0.15], // hook: one fill at half height
  [2.0, 0, 1, 0.15],
  [2.6, 0, 0, 0.15],
  [9.6, 1, 0, 0.4], // "top tap"
  [13.2, 0, 0, 0.3], // top closes first
  [13.6, 0, 1, 0.4], // "bottom tap"
  [15.8, 0, 0, 0.2],
  [16.3, 1, 0, 0.15], // "fills"
  [17.0, 0, 1, 0.15], // "empties"
  [17.75, 0, 0, 0.1],
  [19.0, 1, 0, 0.4], // "The tank fills" (half height)
  [21.3, 0, 0, 0.3],
  [27.0, 0, 1, 0.4], // drain before the stand returns
  [29.7, 0, 0, 0.3],
  [66.9, 0.5, 0.5, 0.3], // "both are half open"
  [67.9, 0, 1, 0.3], // top shuts, the tank drains
  [68.9, 0, 0, 0.2], // start frame
];
function tapsAt(t: number) {
  let top = 0;
  let bot = 0;
  for (const [a, p, n, d] of TAPS) {
    if (t < a) break;
    const k = ease((t - a) / d);
    top += (p - top) * k;
    bot += (n - bot) * k;
  }
  return { top, bot };
}

// Circuit input lever: [time, value]; starts at 1 (NMOS on, output 0).
const IN_MOVES: [number, number][] = [
  [44.0, 0], // "Each tick": fill
  [47.4, 1], // "bottom switch": drain
  [49.4, 0], // "Each fill" at 1.0 V
  [52.4, 1],
  [54.4, 0], // fill at 0.5 V, held through the key state
  [60.3, 1],
  [63.1, 0], // three fast ticks
  [63.35, 1],
  [63.6, 0],
  [63.85, 1],
  [64.1, 0],
  [64.35, 1],
];
const inAt = (t: number) => {
  let v = 1;
  for (const [a, x] of IN_MOVES) {
    if (t < a) break;
    v = x;
  }
  return v;
};
const fast = (t: number) => inside(t, 63.0, 65.0);
// Lever knob position (eased).
export function leverAt(t: number) {
  let v = 1;
  for (const [a, x] of IN_MOVES) {
    if (t < a) break;
    v += (x - v) * ease((t - a) / (fast(a) ? 0.08 : 0.18));
  }
  return v;
}
// Break-before-make: a valve turns off D_OFF after the lever leaves its side and on D_ON after the lever reaches it.
const delays = (t: number) => (fast(t) ? [0.03, 0.08] : [0.4, 0.9]);
function valvesAt(t: number) {
  const [dOff, dOn] = delays(t);
  const a = inAt(t - dOff);
  const b = inAt(t - dOn);
  return { pOn: a === 0 && b === 0, nOn: a === 1 && b === 1, nFaint: inAt(t) === 0 && a === 1 };
}

// Clock ticks (one twelfth turn each); the fold back sweeps the hand on to 12.
export const TICKS = [15.2, 16.3, 19.0, 44.0, 49.4, 54.4, 63.1, 63.6, 64.1];
export function handAt(t: number) {
  let n = 0;
  for (const a of TICKS) n += ramp(t, a, 0.12);
  const turn = (n / 12) * Math.PI * 2;
  return turn + (Math.PI * 2 - (TICKS.length / 12) * Math.PI * 2) * ramp(t, BACK[0], BACK[1] - BACK[0]);
}

// Time constant: fast windows for the quick fills, slower water elsewhere.
function tauAt(t: number) {
  if (inside(t, 1.3, 2.9)) return 0.08;
  if (inside(t, 16.2, 17.9)) return 0.12;
  if (inside(t, 63.0, 65.0)) return 0.05;
  if (inside(t, 66.8, 69.2)) return 0.2;
  return t >= 32.8 && t < 65.5 ? 0.45 : 0.5;
}

// Pump runs: "A pump", after each fill (tops the tower up), "Each litre".
const pumpWindow = (t: number) => inside(t, 7.6, 9.6) || inside(t, 21.0, 22.6);

// ---------- Simulation ----------

const DT = 0.01;
type Row = { H: number; top: number; bot: number; L: number; iP: number; iN: number; out: number; pOn: boolean; nOn: boolean; nFaint: boolean };
function simulate() {
  const n = Math.ceil(END / DT) + 2;
  const rows: Row[] = [];
  let L = 0;
  let out = 0;
  for (let i = 0; i < n; i++) {
    const t = i * DT;
    const H = heightAt(t);
    const circuit = morphAt(t) >= 0.5;
    const v = valvesAt(t);
    const w = tapsAt(t);
    const top = circuit ? (v.pOn ? 1 : 0) : w.top;
    const bot = circuit ? (v.nOn ? 1 : 0) : w.bot;
    const iP = top * (H - L);
    const iN = bot * L;
    L = Math.max(0, L + ((iP - iN) * DT) / tauAt(t));
    if (L > 0.85 * H) out = 1;
    if (L < 0.15 * H) out = 0;
    rows.push({ H, top, bot, L, iP, iN, out, pOn: circuit && v.pOn, nOn: circuit && v.nOn, nFaint: circuit && v.nFaint });
  }
  return rows;
}
const SIM = simulate();
const rowAt = (t: number) => SIM[Math.min(SIM.length - 1, Math.max(0, Math.round(t / DT)))];

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

// ---------- Readout grid ----------
// Cell index = row * 4 + col (row 0 = bottom). States: off, mark (its column or row named), lit (rust), flash.
export type Cell = "off" | "mark" | "lit" | "flash";
function gridAt(t: number): { cells: Cell[]; pulseCols: boolean; pulseRows: boolean; pulseAll: boolean } {
  const cells: Cell[] = Array(16).fill("off");
  const put = (cols: number, rows: number, s: Cell) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells[r * 4 + c] = s;
  };
  const mark = (cols: number, rows: number) => {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (c < cols || r < rows) cells[r * 4 + c] = "mark";
  };
  let pulseCols = false;
  let pulseRows = false;
  let pulseAll = false;
  if (inside(t, 2.0, 2.85)) {
    const b = blockOf(heightAt(1.8));
    put(b.cols, b.rows, "lit");
  } else if (inside(t, 23.2, 30.0)) {
    const b = blockOf(heightAt(20));
    mark(b.cols, t >= 24.2 ? b.rows : 0);
    if (t >= 25.2) put(b.cols, b.rows, "lit");
    pulseCols = inside(t, 27.4, 27.9);
    pulseRows = inside(t, 27.9, 28.4);
  } else if (inside(t, 50.6, 53.3)) {
    const b = blockOf(heightAt(50));
    put(Math.min(b.cols, Math.floor((t - 50.6) / 0.35) + 1), b.rows, "lit");
    pulseAll = inside(t, 52.0, 52.5);
  } else if (inside(t, 54.6, BACK[0])) {
    const b = blockOf(heightAt(55));
    mark(b.cols, t >= 55.6 ? b.rows : 0);
    if (t >= 57.0) put(b.cols, b.rows, [63.15, 63.65, 64.15].some((a) => inside(t, a, a + 0.2)) ? "flash" : "lit");
    pulseCols = inside(t, 60.1, 60.6);
    pulseRows = inside(t, 61.1, 61.6);
  }
  return { cells, pulseCols, pulseRows, pulseAll };
}

// ---------- State per frame ----------

export function stateAt(time: number) {
  const t = vtOf(time);
  const r = rowAt(t);
  const m = morphAt(t);
  const circuit = m > 0.5;
  const pump = !circuit && (pumpWindow(t) || r.top > 0.05);
  return {
    t,
    m,
    H: r.H, // tower / rail level (1 = mark 4 = 1.0 V)
    volts: r.H,
    level: r.L, // tank / output level (same scale)
    top: r.top,
    bot: r.bot,
    iP: Math.max(0, r.iP), // charging current (relative)
    iN: r.iN, // draining current
    net: r.iP - r.iN,
    out: r.out,
    pOn: r.pOn,
    nOn: r.nOn,
    nFaint: r.nFaint,
    lever: leverAt(t),
    hand: handAt(t),
    pump,
    shake: bump(t, 6.0, 0.4) * Math.sin(t * 90) + (pump ? 0.15 * Math.sin(t * 70) : 0),
    grid: gridAt(t),
    // Analogy beats.
    towerPulse: bump(t, 4.7, 0.6),
    levelLine: inside(t, 11.6, 13.4) ? Math.min(ramp(t, 11.6, 0.3), 1 - ramp(t, 13.1, 0.3)) : 0,
    heightBracket: inside(t, 21.7, 26.5) ? Math.min(ramp(t, 21.7, 0.3), 1 - ramp(t, 26.2, 0.3)) : 0,
    dialPulse: bumps(t, TICKS, 0.5),
    // Circuit beats.
    towerGhost: inside(t, 34.1, 35.5) ? ramp(t, 34.1, 1.3) : -1, // melt progress, -1 = hidden
    tankGhost: inside(t, 37.7, 38.9) ? ramp(t, 37.7, 1.1) : -1,
    tapGhost: inside(t, 41.7, 42.9) ? ramp(t, 41.7, 1.1) : -1,
    railPulse: bump(t, 35.8, 0.6),
    tagPulse: bumps(t, [36.4, 62.1], 0.6),
    lineShow: circuit && t >= 36.4 ? ramp(t, 36.4, 0.4) : 0,
    busFlash: bump(t, 38.7, 0.7),
    shimmer: bump(t, 40.0, 1.0),
    pFlash: bump(t, 42.7, 0.5),
    nFlash: bump(t, 43.2, 0.5),
  };
}
export type State = ReturnType<typeof stateAt>;
