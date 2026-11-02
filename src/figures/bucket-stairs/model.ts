// Lowering supply voltage as carrying buckets up a building, then a real CMOS inverter, chip-design episode 17 ("Why
// does lowering supply voltage save so much power"), built on the recorded voice.
// Time unit: one video second = one voice second (the voice starts at 0 while the board lands; the 3 s entrance is
// included). One voltage step (tick) = one building floor = one bucket or drop of charge.
// LOOP = 73.8 s, so the video is 76.8 s. The fold back (71.2-72.8) returns to the start frame (four floors, tank empty
// and blue, Sam and four buckets at the stair foot, counter 0), held to 76.8, so the loop ends in its start state.
// Timeline (below): beat times from builds/notes/episodes/chip-design/17.page.md, part arrivals, Sam's trips (start,
// walk, time per floor), the packets of charge (start, run time), the folds and the input lever moves. Everything else
// is computed:
// floors climbed = buckets x floors per trip; packets = voltage steps (charge = C x V), energy = drops x steps
// (= C x V x V): 16 at 1.0 V, 4 at 0.5 V, ratio 0.25. The output tank follows dL/dt = (P x (V - L) - N x L) / tau
// with P, N the PMOS and NMOS gates from the lever (break-before-make), plus the packets arriving; L never exceeds V.
export const LOOP = 73.8;
export const END = 3 + LOOP;
export const BRAND = "ROLLIN";
export const FLOORS = 4;

// ---------- Arithmetic ----------
export const C = 1; // one bucket (drop) per floor (step) of tank
export const charge = (v: number) => C * v; // buckets or drops needed to fill to v floors (steps)
export const energy = (v: number) => charge(v) * v; // floors (steps) climbed = buckets x floors per trip
export const V_FULL = FLOORS; // 1.0 V = four steps
export const V_HALF = FLOORS / 2; // 0.5 V = two steps
export const E_FULL = energy(V_FULL); // 16
export const E_HALF = energy(V_HALF); // 4
export const RATIO = E_HALF / E_FULL; // 0.25
export const voltsOf = (v: number) => (v / V_FULL).toFixed(1); // steps -> volts label

// ---------- Helpers ----------
const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const ramp = (t: number, a: number, d: number) => ease((t - a) / d);
const inside = (t: number, a: number, b: number) => t >= a && t < b;
const bump = (t: number, a: number, d: number) => (t < a || t > a + d ? 0 : Math.sin((Math.PI * (t - a)) / d));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const vtOf = (t: number) => (t < END ? t : 3 + ((t - 3) % LOOP));

// ---------- Folds ----------
export const FOLD = [28.9, 30.4];
export const BACK = [71.2, 72.8];
export const morphAt = (t: number) => (t < BACK[0] ? ramp(t, FOLD[0], FOLD[1] - FOLD[0]) : 1 - ramp(t, BACK[0], BACK[1] - BACK[0]));

// ---------- Trips (Sam with a bucket, or a drop of charge) ----------
// Sam: home -> stair foot -> one flight per floor (zig-zag) -> across the roof to the spout -> pour.
// Drop: home on the GND rail -> foot of the source's column -> one tick per step -> along VDD through the PMOS ->
// down the output wire into the output tank.
export type Trip = { who: "sam" | "drop"; i: number; pick: number; start: number; walk: number; per: number; floors: number; roof: number; pour: number; full: boolean };
const trip = (who: Trip["who"], i: number, start: number, walk: number, per: number, floors: number, roof: number, pour: number, full: boolean, pick = start): Trip => ({ who, i, pick, start, walk, per, floors, roof, pour, full });
export const tripEnd = (r: Trip) => r.start + r.walk + r.per * r.floors + r.roof + r.pour;
export const climbEnd = (r: Trip) => r.start + r.walk + r.per * r.floors;
// Chained: each trip starts when the one before it ends.
function chain(who: Trip["who"], start: number, floors: number, full: boolean, legs: [number, number, number, number, number][], firstPick?: number) {
  const out: Trip[] = [];
  let s = start;
  legs.forEach(([i, walk, per, roof, pour], k) => {
    const r = trip(who, i, s, walk, per, floors, roof, pour, full, k === 0 && firstPick !== undefined ? firstPick : s);
    out.push(r);
    s = tripEnd(r);
  });
  return out;
}
// Analogy, four floors: bucket 1 picked up at 7.1, carried from 12.6; buckets 2-4 each a little faster (16 by 16.0).
export const RUN_A = chain("sam", 12.6, V_FULL, true, [[0, 0.25, 0.18, 0.12, 0.15], [1, 0.08, 0.13, 0.07, 0.08], [2, 0.08, 0.11, 0.07, 0.08], [3, 0.08, 0.1, 0.07, 0.08]], 7.1);
// Analogy, two floors: two buckets, two floors each (from 20.3).
export const RUN_B = chain("sam", 20.3, V_HALF, false, [[0, 0.2, 0.25, 0.1, 0.15], [1, 0.15, 0.2, 0.1, 0.15]]);

// Where a trip is at time t: phase and progress; floorsDone counts landings (ticks) reached.
export type TripAt = { phase: "wait" | "walk" | "climb" | "roof" | "pour" | "done"; u: number; floor: number; floorsDone: number };
export function tripAt(r: Trip, t: number): TripAt {
  let s = r.start;
  if (t < s) return { phase: "wait", u: 0, floor: 0, floorsDone: 0 };
  if (t < s + r.walk) return { phase: "walk", u: (t - s) / r.walk, floor: 0, floorsDone: 0 };
  s += r.walk;
  if (t < s + r.per * r.floors) {
    const f = (t - s) / r.per;
    return { phase: "climb", u: f - Math.floor(f), floor: Math.floor(f) + 1, floorsDone: Math.floor(f) };
  }
  s += r.per * r.floors;
  if (t < s + r.roof) return { phase: "roof", u: (t - s) / r.roof, floor: r.floors, floorsDone: r.floors };
  s += r.roof;
  if (t < s + r.pour) return { phase: "pour", u: (t - s) / r.pour, floor: r.floors, floorsDone: r.floors };
  return { phase: "done", u: 1, floor: r.floors, floorsDone: r.floors };
}
const climbed = (runs: Trip[], t: number) => runs.reduce((n, r) => n + tripAt(r, t).floorsDone, 0);
const poured = (runs: Trip[], t: number) =>
  runs.reduce((n, r) => {
    const a = tripAt(r, t);
    return n + (a.phase === "done" ? 1 : a.phase === "pour" ? a.u : 0);
  }, 0);
// Arrival times at each landing (for the effort puffs).
export const arrivals = (r: Trip) => Array.from({ length: r.floors }, (_, k) => ({ t: r.start + r.walk + r.per * (k + 1), floor: k + 1 }));

// ---------- Circuit: packets of charge ----------
// A packet runs from its home on the VDD rail through the PMOS along the strap into the output tank in `dur` seconds;
// it adds one mark (one step of Vout) over the last 15 % of its run, and delivers charge x VDD = `steps` of energy.
export type Packet = { i: number; start: number; dur: number; steps: number };
const pk = (i: number, start: number, dur: number, steps: number): Packet => ({ i, start, dur, steps });
// 1.0 V: packet 1 from 43.7 (arrives 46.5); packets 2-4 from 49.4, 50.0, 50.6 (arrive 50.6, 51.2, 51.8).
export const RUN_C = [pk(0, 43.7, 2.8, V_FULL), pk(1, 49.4, 1.2, V_FULL), pk(2, 50.0, 1.2, V_FULL), pk(3, 50.6, 1.2, V_FULL)];
// 0.5 V: two packets from 57.1 and 57.9 (arrive 58.5, 59.2).
export const RUN_D = [pk(0, 57.1, 1.4, V_HALF), pk(1, 57.9, 1.3, V_HALF)];
export const packetU = (p: Packet, t: number) => clamp01((t - p.start) / p.dur);
const IN_AT = 0.85;
const arrived = (runs: Packet[], t: number) => runs.reduce((n, p) => n + clamp01((packetU(p, t) - IN_AT) / (1 - IN_AT)), 0);
// Energy from VDD = sum over delivered packets of charge x VDD (each packet is one unit of charge lifted `steps`).
const delivered = (runs: Packet[], t: number) => runs.reduce((n, p) => n + (packetU(p, t) >= 1 ? p.steps : 0), 0);

// ---------- Circuit: supply, input lever, switches, output tank ----------
// Supply in steps: four (1.0 V), lowered to two (0.5 V) at "Halve the voltage" (53.2).
export const vddAt = (t: number) => V_FULL - (V_FULL - V_HALF) * ramp(t, 53.2, 0.6);
// Input lever moves [time, value]. It lands at 1 with its gates not yet driven, then flips to 0 (PMOS on).
const LEVER: [number, number][] = [
  [34.9, 0], // "To store a one": only the PMOS conducts
  [42.5, 1], // after "building's height": empty the tank through the NMOS
  [44.0, 0], // PMOS on again for packet 1
  [53.2, 1], // "Halve the voltage": drain to GND
  [57.0, 0], // PMOS on for the half-voltage packets
  [66.3, 1], // "The wire fills through": 1 ...
  [66.75, 0], // ... then 0: the PMOS fills it
  [68.2, 1], // "empties through another": PMOS lets go first, then the NMOS empties it
  [70.1, 0.5], // "both are half open"
  [71.1, 0],
];
const SWITCH = 0.15; // gate swing time
const GAP = 0.2; // break-before-make: the second gate starts after the first one let go
export function inputAt(t: number) {
  let lever = 1;
  let top = 0; // PMOS gate (conducts while the input is 0)
  let bot = 0; // NMOS gate (conducts while the input is 1)
  for (const [a, v] of LEVER) {
    if (t < a) break;
    const p = lever;
    const p0 = top;
    const n0 = bot;
    lever = p + (v - p) * ramp(t, a, 0.2);
    const rising = v > p; // toward 1: PMOS closes first
    top = p0 + (1 - v - p0) * ramp(t, rising ? a : a + GAP, SWITCH);
    bot = n0 + (v - n0) * ramp(t, rising ? a + GAP : a, SWITCH);
  }
  return { lever, top, bot };
}
// Packet windows: while packets carry the charge, the PMOS current is the packets themselves (no extra flow).
const WINDOWS: [number, number, Packet[]][] = [
  [43.2, 53.2, RUN_C],
  [56.0, 66.3, RUN_D],
];
const DT = 0.01;
const TAU = 0.3; // RC: dL/dt = (P x (V - L) - N x L) / tau
const SIM_FROM = 34.5;
const SIM_TO = BACK[1] + 0.05;
const SIM = (() => {
  const rows: { L: number; iP: number; iN: number }[] = [];
  let L = 0;
  for (let k = 0; ; k++) {
    const t = SIM_FROM + k * DT;
    if (t > SIM_TO) break;
    const { top, bot } = inputAt(t);
    const V = vddAt(t);
    const w = WINDOWS.find(([a, b]) => t >= a && t < b);
    const iP = w ? 0 : top * Math.max(0, V - L);
    const iN = bot * L;
    const add = w ? arrived(w[2], t + DT) - arrived(w[2], t) : 0;
    L = Math.min(V, Math.max(0, L + ((iP - iN) * DT) / TAU + add));
    if (bot > 0.9 && L < 0.1) L = 0; // emptied
    rows.push({ L, iP, iN });
  }
  return rows;
})();
const simAt = (t: number) => (t < SIM_FROM ? { L: 0, iP: 0, iN: 0 } : SIM[Math.min(SIM.length - 1, Math.max(0, Math.round((t - SIM_FROM) / DT)))]);
export const voutAt = (t: number) => simAt(t).L;

// Vout graph: one time window per spoken step; the trace is drawn from the window's start up to now.
export const GRAPH_WINDOWS: [number, number][] = [
  [34.5, 44.0],
  [44.0, 53.2],
  [53.2, 66.3],
  [66.3, BACK[0]],
];
export const graphWindow = (t: number) => GRAPH_WINDOWS.find(([a, b]) => t >= a && t < b) ?? null;

// Arrivals of the circuit parts (one per spoken line); everything leaves in the fold back.
const ARRIVE = { rails: 29.4, wire: 30.9, tank: 31.1, p: 33.7, n: 34.1, lever: 34.5 };

// ---------- State per frame ----------
export function stateAt(time: number) {
  const t = vtOf(time);
  const m = morphAt(t);
  const circuit = t >= FOLD[0] && t < BACK[1];

  // Building: floors 3-4 (alpha, slide), the low roof at floor 2.
  let upperA = 1;
  let upperDz = 0;
  let roofLowA = 0;
  let tankH = V_FULL;
  let tankGhostA = 0;
  if (t < 2.4) {
    const g = ramp(t, 0.4, 0.5) - ramp(t, 1.7, 0.5); // hook: half height via ghosts
    upperA = 1 - 0.78 * g;
    roofLowA = g;
    if (inside(t, 0.4, 2.2)) {
      tankH = V_HALF;
      tankGhostA = upperA;
    }
  } else if (inside(t, 17.7, FOLD[0])) {
    // 17.7: floors slide down and the stairs fold first; the tank waits. 18.8: the tank drains and shrinks.
    const s = ramp(t, 17.7, 0.8);
    upperDz = -V_HALF * s;
    upperA = 1 - ramp(t, 18.0, 0.5);
    roofLowA = ramp(t, 18.2, 0.4);
    tankH = V_FULL - V_HALF * ramp(t, 18.8, 0.6);
    const flash = bump(t, 24.2, 0.9) * 0.4; // ghosts of the missing floors
    if (flash > 0) {
      upperDz = 0;
      upperA = flash;
    }
  } else if (inside(t, FOLD[0], BACK[0])) {
    upperDz = -V_HALF;
    upperA = 0;
    roofLowA = 1;
    tankH = V_HALF;
  }
  const roofV = roofLowA > 0.5 ? V_HALF : V_FULL;

  // Analogy tank contents (floors).
  const runA = poured(RUN_A, t);
  const runB = poured(RUN_B, t);
  let level = 0;
  let drainA = 0;
  if (t < 18.8) level = Math.min(runA, V_FULL);
  else if (t < 19.4) {
    level = V_FULL * (1 - ramp(t, 18.8, 0.6));
    drainA = 1;
  } else if (t < FOLD[0]) level = runB;
  level = Math.min(level, tankH);
  // Dashed full mark on the glass at the roof line (from 10.2; slides down with the roof at 18.8).
  const fullMark = t < FOLD[0] ? ramp(t, 10.2, 0.4) : 0;

  // Analogy parts leave in the fold and return in the fold back; the building shrinks away and fades out completely.
  const analogyA = t < BACK[0] ? 1 - ramp(t, FOLD[0], 0.8) : ramp(t, 72.0, 0.8);
  const melt = t < BACK[0] ? ramp(t, FOLD[0], 1.3) : 1 - ramp(t, 71.4, 1.4);
  const samA = analogyA;

  // Buckets at home: visible, slide off.
  const buckets = [0, 1, 2, 3].map((i) => {
    let a = 1;
    let dy = 0;
    const pickA = RUN_A[i].pick;
    if (inside(t, pickA, 17.7)) a = 0;
    if (inside(t, 17.7, FOLD[0])) {
      a = ramp(t, 17.7, 0.4);
      if (i >= 2) {
        const s = ramp(t, 19.4, 0.8);
        dy = 34 * s;
        a = Math.min(a, 1 - ramp(t, 19.8, 0.4));
        const ghost = bump(t, 22.9, 0.9) * 0.4;
        if (t > 20.3) {
          a = ghost;
          dy = 0;
        }
      } else if (t >= RUN_B[i].start) a = 0;
    }
    if (t >= FOLD[0]) a *= analogyA;
    return { a, scale: 1, dy };
  });
  const carrying = RUN_A.concat(RUN_B).find((r) => t >= r.pick && t < tripEnd(r) - r.pour * 0.3);

  // ---------- Circuit ----------
  const out = t >= BACK[0] ? 1 - ramp(t, BACK[0], 0.6) : 1;
  const arrive = (a: number, d = 0.5) => (t < BACK[0] ? ramp(t, a, d) : out);
  const railsA = circuit ? arrive(ARRIVE.rails, 0.9) : 0;
  const wireA = circuit ? arrive(ARRIVE.wire, 0.6) : 0;
  const tankA = circuit ? arrive(ARRIVE.tank, 0.5) : 0;
  const pA = circuit ? arrive(ARRIVE.p, 0.4) : 0;
  const nA = circuit ? arrive(ARRIVE.n, 0.4) : 0;
  const leverA = circuit ? arrive(ARRIVE.lever, 0.4) : 0;
  const V = vddAt(t);
  const inp = inputAt(t);
  const sim = simAt(t);
  const cLevel = circuit ? Math.min(V, sim.L) : 0;
  // A packet on its way carries the PMOS current; 38.3 ("pushes that charge in") brightens the PMOS strap once.
  const runsNow = t < 55 ? RUN_C : RUN_D;
  const moving = runsNow.some((p) => {
    const u = packetU(p, t);
    return u > 0 && u < 1;
  });
  const push = bump(t, 38.3, 0.8);
  const iP = Math.max(sim.iP, moving ? 0.8 : 0, push);
  const iN = sim.iN;
  const through = clamp01((Math.min(inp.top, inp.bot) - 0.25) * 4) * out; // both half open: VDD -> GND

  // Packets: four wait on the VDD rail (43.2), run, vanish into the tank; back at 53.8; two fade away at 56.3.
  const packets = [0, 1, 2, 3].map((i) => {
    let a = 0;
    let dz = 0;
    let p: Packet | null = null;
    if (inside(t, 43.2, 53.2)) {
      a = ramp(t, 43.2, 0.4);
      p = RUN_C[i];
    } else if (inside(t, 53.8, 66.3)) {
      a = ramp(t, 53.8, 0.5);
      if (i >= 2) {
        dz = 6 * ramp(t, 56.3, 0.6);
        a = Math.min(a, 1 - ramp(t, 56.3, 0.5));
      } else p = RUN_D[i];
    }
    const u = p ? packetU(p, t) : 0;
    if (p) a *= 1 - clamp01((u - 0.9) / 0.1);
    return { a, dz, u, pulse: i < 2 ? bump(t, 56.3, 0.6) : 0 };
  });

  // Full-voltage copy (56.6): full to mark 4, slides right and dims; labels; hold to 65.6, leaves by 66.3.
  const copyA = inside(t, 56.6, 66.3) ? Math.min(ramp(t, 56.6, 0.3) * (1 - 0.5 * ramp(t, 57.2, 0.6)), 1 - ramp(t, 66.0, 0.3)) : 0;
  const copySlide = ramp(t, 56.6, 0.9);
  const copyLabel = inside(t, 57.0, 66.3) ? Math.min(ramp(t, 57.0, 0.4), 1 - ramp(t, 66.0, 0.3)) : 0;
  const liveLabel = inside(t, 59.0, 66.3) ? Math.min(ramp(t, 59.0, 0.4), 1 - ramp(t, 66.0, 0.3)) : 0;

  // Readout.
  const energyMode = t >= 29.4 && t < BACK[0];
  const cA = climbed(RUN_A, t);
  const cB = climbed(RUN_B, t);
  const eFull = delivered(RUN_C.slice(1), t) + (t >= 47.0 ? delivered(RUN_C.slice(0, 1), t) : 0);
  const eHalf = delivered(RUN_D, t);
  let c1 = 0;
  let c2: number | null = null;
  if (t < FOLD[0]) {
    c1 = cA;
    if (t >= 21.5) c2 = cB;
  } else if (energyMode) {
    c1 = eFull;
    c2 = eHalf;
  }
  const rec = {
    mode: energyMode ? "energy" : "floors",
    title: energyMode ? ["ENERGY FROM VDD", ""] : ["FLOORS CLIMBED", "= EFFORT"],
    heads: energyMode ? [`${voltsOf(V_FULL)} V`, `${voltsOf(V_HALF)} V`] : ["4 floors", "2 floors"],
    showHead: c2 !== null,
    c1,
    c2,
    line1: t >= 13.7 && t < FOLD[0] ? "4 buckets x 4 floors" : energyMode && t >= 49.4 ? `${charge(V_FULL)} drops x ${V_FULL} steps` : "",
    line2: t >= 21.5 && t < FOLD[0] ? "2 buckets x 2 floors" : energyMode && t >= 57.1 ? `${charge(V_HALF)} drops x ${V_HALF} steps` : "",
    act1: (inside(t, 12.6, 21.5) && c1 > 0) || inside(t, 47.0, 53.2),
    act2: inside(t, 21.5, FOLD[0]) || (energyMode && t >= 57.1),
    dim1: inside(t, 21.5, FOLD[0]) || inside(t, 53.2, BACK[0]),
    pulse1: bump(t, 16.0, 0.6) + bump(t, 52.1, 0.6),
    pulse2: bump(t, 59.6, 0.7),
  };

  // Vout graph: shown with the circuit readouts (slides in during the fold).
  const graphA = circuit ? (t < BACK[0] ? ramp(t, 29.6, 0.8) : out) : 0;

  return {
    t,
    m,
    circuit,
    upperA,
    upperDz,
    roofLowA,
    roofV,
    tankH,
    tankGhostA,
    level,
    drainA,
    fullMark,
    analogyA,
    melt,
    samA,
    buckets,
    carrying,
    // Circuit.
    railsA,
    wireA,
    tankA,
    pA,
    nA,
    leverA,
    V,
    lever: inp.lever,
    top: circuit ? inp.top : 0,
    bot: circuit ? inp.bot : 0,
    cLevel,
    iP: circuit ? iP : 0,
    iN: circuit ? iN : 0,
    through,
    out: cLevel > V / 2 ? 1 : 0,
    packets,
    copyA,
    copySlide,
    copyLabel,
    liveLabel,
    rec,
    graphA,
    // Beats.
    lookUp: ramp(t, 5.1, 0.4) * (1 - ramp(t, 6.6, 0.4)),
    buildingPulse: bump(t, 3.5, 0.6),
    roofPulse: bump(t, 8.0, 0.6),
    floorLines: [0, 1, 2, 3].map((k) => {
      const on = ramp(t, 10.2 + 0.45 * k, 0.4);
      if (t < 17.7) return on;
      if (t >= FOLD[0]) return 0;
      return k >= 2 ? 1 - ramp(t, 17.7, 0.4) : 1; // floors 1-2 stay joined to the tank
    }),
    floorLinesA: t < FOLD[0] ? 1 : 0,
    wireFlash: bump(t, 30.9, 1.0),
    tankPulse: bump(t, 32.7, 0.6),
    tag: circuit ? arrive(35.2, 0.3) : 0,
    waterGhost: bump(t, 36.4, 0.9) * 0.5,
    railPulse: bump(t, 37.8, 0.7),
    vddTagPulse: bump(t, 40.9, 0.6) + bump(t, 48.3, 0.6) + bump(t, 63.7, 0.6),
    vddLinePulse: bump(t, 40.9, 0.6),
    buildingGhost: bump(t, 42.3, 1.0) * 0.55,
    tickFlash: [0, 1, 2, 3].map((k) => bump(t, 46.0 + 0.25 * k, 0.4)),
    stepPulse: bump(t, 62.5, 0.6),
    levelLine: inside(t, 54.2, 66.3) ? Math.min(ramp(t, 54.2, 0.5), 1 - ramp(t, 66.0, 0.3)) : 0,
    dropsPulse: bump(t, 61.5, 0.6),
  };
}
export type State = ReturnType<typeof stateAt>;

// Puff events: Sam's effort puffs (one per landing).
export const PUFFS: { t: number; who: "sam"; trip: Trip; floor: number }[] = [...RUN_A, ...RUN_B].flatMap((r) => arrivals(r).map((a) => ({ t: a.t, who: "sam" as const, trip: r, floor: a.floor })));

// ---------- Vout graph (readout, SVG units) ----------
// y: 0 at the bottom to 1.0 V (four ticks, one per step); x: time across the current window.
export const GRAPH = (() => {
  const w = 330;
  const h = 172;
  const left = 58;
  const right = 282;
  const top = 18;
  const bottom = 146;
  const yOf = (steps: number) => bottom - (steps / V_FULL) * (bottom - top);
  // Ghost building beside the plot: one floor per tick.
  const gx0 = 294;
  const gx1 = 324;
  let ghost = `M${gx0},${bottom}V${yOf(V_FULL)}H${gx1}V${bottom}Z`;
  for (let k = 1; k < V_FULL; k++) ghost += `M${gx0},${yOf(k).toFixed(1)}H${gx1}`;
  for (let k = 0; k < V_FULL; k++) {
    const y = yOf(k + 0.75);
    ghost += `M${gx0 + 6},${y.toFixed(1)}h7v10h-7ZM${gx1 - 13},${y.toFixed(1)}h7v10h-7Z`;
  }
  return { w, h, left, right, top, bottom, yOf, ghost };
})();
// Trace of Vout (the tank level) from the window's start up to t; "" outside the circuit windows.
export function graphTrace(t: number) {
  const win = graphWindow(t);
  if (!win) return "";
  const [a, b] = win;
  const x = (s: number) => GRAPH.left + ((s - a) / (b - a)) * (GRAPH.right - GRAPH.left);
  const pts: string[] = [];
  for (let s = a; s < t; s += 0.04) pts.push(`${x(s).toFixed(1)},${GRAPH.yOf(voutAt(s)).toFixed(1)}`);
  pts.push(`${x(t).toFixed(1)},${GRAPH.yOf(voutAt(t)).toFixed(1)}`);
  return "M" + pts.join("L");
}
// Half-voltage step (62.5 pulse): the trace segment where Vout rose to two ticks.
export function graphStep() {
  const [a, b] = GRAPH_WINDOWS[2];
  const x = (s: number) => GRAPH.left + ((s - a) / (b - a)) * (GRAPH.right - GRAPH.left);
  const pts: string[] = [];
  for (let s = 56.9; s < 60.0; s += 0.04) pts.push(`${x(s).toFixed(1)},${GRAPH.yOf(voutAt(s)).toFixed(1)}`);
  return "M" + pts.join("L");
}
