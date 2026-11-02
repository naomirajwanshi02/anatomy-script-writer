// Three small boards (AND, OR, NOT), each first a water rig that folds into its gate: a supply tank feeds pipes
// through taps A and B (in series for AND, side by side for OR, one tap for NOT) into a cup; the taps fold into
// levers, the pipes into wires, the cup into the lamp. Every part is a function of the morph m (0 = water, 1 = circuit).
import {
  boxCorners,
  cylinder,
  faceMatrix,
  fitView,
  flatCircle,
  flatPath,
  flatRect,
  inset,
  pathD,
  prism,
  prismFill,
  project,
  rectCorners,
  rectFrontEdge,
  translateTo,
  type Rect,
  type Vec2,
  type Vec3,
} from "../../iso/iso-kit";
import { bulbParts } from "../../iso/react/bulb";

export const STAGE_W = 240;
export const STAGE_H = 150;

export type GateId = "and" | "or" | "not";
export type Net = "a" | "b" | "y";

const BOARD: Rect = { x: -50, y: -24, w: 96, d: 48, r: 4 };
const GATE = { w: 18, d: 14, h: 5 };
const GATE_X = 2;
const LAMP: Vec2 = [32, 0];
const LAMP_R = 6.2;
const LEVER_X = -36;
const BEND_X = -18;
const IN_X = GATE_X - GATE.w / 2;
const OUT_X = GATE_X + GATE.w / 2;
const PIPE = { z: 0.4, s: 2.2 };
const TAP = { w: 6, h: 5 };
const CUP_H = 10;
const TANK_H = 7;

// Water pipes per board; the `out` pipe folds into the gate's output wire.
const PIPES: Record<GateId, { pts: Vec2[]; net: Net; out?: boolean }[]> = {
  and: [
    { pts: [[-30, -19], [-36, -19], [-36, -12]], net: "y" },
    { pts: [[-36, -6], [-36, 6]], net: "y" },
    { pts: [[-33, 9], [-24, 9], [-24, 0]], net: "y" },
    { pts: [[-24, 0], [27, 0]], net: "y", out: true },
  ],
  or: [
    { pts: [[-30, -19], [-44, -19], [-44, -9]], net: "y" },
    { pts: [[-44, -9], [-39, -9]], net: "a" },
    { pts: [[-44, -9], [-44, 9], [-39, 9]], net: "b" },
    { pts: [[-33, -9], [-24, -9], [-24, 0]], net: "a" },
    { pts: [[-33, 9], [-24, 9], [-24, 0]], net: "b" },
    { pts: [[-24, 0], [27, 0]], net: "y", out: true },
  ],
  not: [
    { pts: [[-30, -19], [-36, -19], [-36, -3]], net: "y" },
    { pts: [[-33, 0], [27, 0]], net: "y", out: true },
  ],
};

const WATER_LABELS: Record<GateId, Record<string, Vec2>> = {
  and: { a: [-32, -0.5], b: [-32, 19.5] },
  or: { a: [-32, -0.5], b: [-32, 19.5] },
  not: { a: [-38.5, 10.5] },
};

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u), d: lerp(a.d, b.d, u), r: lerp(a.r, b.r, u) });
const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 16): Vec2[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

function gateBoard(id: GateId) {
  const two = id !== "not";
  const levers: Record<string, Vec2> = two ? { a: [LEVER_X, -9], b: [LEVER_X, 9] } : { a: [LEVER_X, 0] };
  const view = fitView([...boxCorners(BOARD, -5, 0), [LEVER_X, -16, 18.5], [LEVER_X, 16, 18.5], [LAMP[0], 0, 10]], STAGE_W, STAGE_H, { pad: 10, azimuth: 62 });
  const at = (p: Vec3) => project(p, view);
  const trace = (pts: Vec2[]) => flatPath(pts, 0, view);
  const c: Vec2 = [GATE_X, 0];
  const body: Rect = { x: IN_X, y: -GATE.d / 2, w: GATE.w, d: GATE.d, r: 1.4 };

  // Standard gate symbol engraved on the block top.
  const symbol =
    id === "and"
      ? flatPath([[c[0] - 4.5, -3.6], [c[0] - 4.5, 3.6], ...arc(c[0] + 0.5, 0, 3.6, Math.PI / 2, -Math.PI / 2)], GATE.h, view, true)
      : id === "or"
        ? (() => {
            const top = Array.from({ length: 13 }, (_, i): Vec2 => {
              const u = i / 12;
              return [c[0] - 4.2 + u * 9.2, -3.9 + (1 - Math.cos((u * Math.PI) / 2)) * 3.9];
            });
            const bottom = top.map(([x, y]): Vec2 => [x, -y]).reverse();
            return flatPath([...arc(c[0] - 9, 0, 6.2, 0.62, -0.62), ...top, ...bottom], GATE.h, view, true);
          })()
        : flatPath([[c[0] - 4.5, -3.8], [c[0] - 4.5, 3.8], [c[0] + 2.2, 0]], GATE.h, view, true) + flatCircle(c[0] + 3.6, 0, 1.3, GATE.h, view, 14);

  const lever = ([x, y]: Vec2) => ({
    base: prism({ x: x - 7, y: y - 6, w: 14, d: 12, r: 1.2 }, 0, 4, view, 3, 0.4),
    slot: flatRect({ x: x - 1.2, y: y - 5, w: 2.4, d: 10, r: 1 }, 4, view, 3),
    pivot: cylinder(x, y, 2, 4, 2, view, 18, 0.3),
  });

  const wires: { id: string; net: Net; d: string }[] = two
    ? [
        { id: "a", net: "a", d: trace([[LEVER_X + 7, -9], [BEND_X, -9], [BEND_X, -3.5], [IN_X, -3.5]]) },
        { id: "b", net: "b", d: trace([[LEVER_X + 7, 9], [BEND_X, 9], [BEND_X, 3.5], [IN_X, 3.5]]) },
      ]
    : [{ id: "a", net: "a", d: trace([[LEVER_X + 7, 0], [IN_X, 0]]) }];
  wires.push({ id: "y", net: "y", d: trace([[OUT_X, 0], [LAMP[0] - LAMP_R, 0]]) });

  const face = (x: number, y: number) => faceMatrix([x, y], 0, view, "x");
  const cupFrom: Rect = { x: LAMP[0] - 5, y: -5, w: 10, d: 10, r: 0.8 };
  const cupTo: Rect = { x: LAMP[0] - 4.6, y: -4.6, w: 9.2, d: 9.2, r: 4.6 };
  const tankRect: Rect = { x: -30, y: -22, w: 14, d: 6, r: 0.8 };
  const tapRect = ([x, y]: Vec2): Rect => ({ x: x - TAP.w / 2, y: y - TAP.w / 2, w: TAP.w, d: TAP.w, r: 0.8 });
  // A pipe segment from p to q (axis-aligned) as a thin prism of width s.
  const segment = (p: Vec2, q: Vec2, z: number, s: number, h: number) => {
    const half = s / 2;
    const r: Rect = {
      x: Math.min(p[0], q[0]) - (p[1] === q[1] ? 0 : half),
      y: Math.min(p[1], q[1]) - (p[0] === q[0] ? 0 : half),
      w: Math.abs(q[0] - p[0]) + (p[1] === q[1] ? 0 : s),
      d: Math.abs(q[1] - p[1]) + (p[0] === q[0] ? 0 : s),
      r: 0.3,
    };
    return prism(r, z, h, view, 2, 0.15);
  };
  const pipes = PIPES[id];
  const outPts = pipes.find((p) => p.out)!.pts;
  const leverAt = Object.values(levers);

  const water = {
    tapSolid: (i: number, m: number) => prism(lerpRect(tapRect(leverAt[i]), body, m), 0, TAP.h, view, 3, 0.4),
    pipeSolids: (i: number, m: number) => {
      const p = pipes[i];
      const pts: Vec2[] = p.out ? [[lerp(outPts[0][0], OUT_X, m), 0], [lerp(outPts[1][0], LAMP[0] - LAMP_R, m), 0]] : p.pts;
      const s = lerp(PIPE.s, 0.8, m);
      return pts.slice(1).map((q, j) => segment(pts[j], q, lerp(PIPE.z, 0, m), s, lerp(PIPE.s, 0.2, m)));
    },
    pipes: pipes.map((p) => ({ net: p.net, drops: flatPath(p.pts, PIPE.z + PIPE.s + 0.05, view) })),
    // Tap handle: the lever knob, short and low on the tap in water, full lever in the circuit.
    handleKnob: ([x, y]: Vec2, v: number, m: number): Vec3 => {
      const z = lerp(TAP.h + 0.5, 6, m);
      const len = lerp(7, 12, m);
      return [x, y + Math.sin(v * 0.6) * len, z + Math.cos(v * 0.6) * len];
    },
    handleRod(p: Vec2, v: number, m: number) {
      return pathD([at([p[0], p[1], lerp(TAP.h + 0.5, 6, m)]), at(this.handleKnob(p, v, m))]);
    },
    cupAt: (m: number) => ({ rect: lerpRect(cupFrom, cupTo, m), h: lerp(CUP_H, 7.6, m) }),
    cupSolid: (m: number) => prism(lerpRect(cupFrom, cupTo, m), 0, lerp(CUP_H, 7.6, m), view, 8, 0.3),
    // The supply tank sinks away during the first half of the fold.
    tankAt: (m: number) => {
      const s = Math.max(0, 1 - m / 0.5);
      return { rect: tankRect, h: TANK_H * s, s };
    },
    tankSolid: (m: number) => prism(tankRect, 0, TANK_H * Math.max(0, 1 - m / 0.5), view, 3, 0.3),
    labels: Object.fromEntries(Object.entries(WATER_LABELS[id]).map(([k, [x, y]]) => [k, face(x, y)])),
  };

  const contacts = [...leverAt.flatMap((p) => rectCorners(tapRect(p))), ...rectCorners(cupFrom), ...rectCorners(tankRect)].map(([x, y]) => at([x, y, 0]));

  return {
    view,
    levers,
    contacts,
    water,
    knobAt: ([x, y]: Vec2, v: number): Vec3 => [x, y + Math.sin(v * 0.6) * 12, 6 + Math.cos(v * 0.6) * 12],
    rodPath(p: Vec2, v: number) {
      return pathD([at([p[0], p[1], 6]), at(this.knobAt(p, v))]);
    },
    knob: cylinder(0, 0, 2.4, -1.2, 2.8, view, 20, 0.6),
    knobTransform: (p: Vec3) => translateTo(view, p),
    halo: prismFill(BOARD, -5, 5, view),
    board: prism(BOARD, -5, 5, view, 5, 0.8),
    groove: flatRect(inset(BOARD, 3), 0, view),
    screws: rectCorners(BOARD, 5).map(([x, y]) => at([x, y, 0])),
    leverParts: Object.fromEntries(Object.entries(levers).map(([k, p]) => [k, lever(p)])),
    gate: { halo: prismFill(inset(body, 1), 0.1, 0.1, view), body: prism(body, 0, GATE.h, view, 3, 0.6), seam: rectFrontEdge(body, 1.8, view, 3), symbol },
    wires,
    lamp: bulbParts(LAMP, view, { baseR: LAMP_R, h: 6 }),
    labels: { ...Object.fromEntries(Object.entries(levers).map(([k, [, y]]) => [k, face(LEVER_X + 8.5, y - 1.8)])), y: face(LAMP[0] - 1.4, LAMP[1] + 13) },
  };
}

export const boards = { and: gateBoard("and"), or: gateBoard("or"), not: gateBoard("not") };
