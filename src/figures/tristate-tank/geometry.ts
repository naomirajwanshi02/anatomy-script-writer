// Tri-state tank: one board (always on screen). x runs right, y toward the viewer (front face +y), z up.
// Rows, back to front, shared by both scenes so each part folds in place:
//   y -112 supply pipe (raised, fed by the high supply tank at the back left) -> VDD rail
//   y  -55 fill taps -> PMOS blocks (w = 2)
//   y   -5 header pipe into the tank (right) -> the bus, its meter end at the right
//   y   35 drain taps -> NMOS blocks (w = 1)
//   y   56 gutter -> GND rail
//   y  100 lock levers (front-face number, later EN1..3) and level gauges, in front of every pipe and rail.
// Visibility at azimuth 62: a part of height H hides the board up to about 2 H behind it and to the left. The lever
// boxes (16 high) and gauges (12 high) stand 34+ units in front of the gutter; each EN link runs to the right of its
// lever box, so no box hides it; the tank stands right of column 3's riser (its silhouette starts right of it).
import { boxCorners, cylinder, fitView, flatPath, flatRect, heightPx, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3 } from "../../iso/iso-kit";
import { pipeX, pipeY, waterBox } from "../../iso/analogy/water";

export const STAGE_W = 600;
const AZIMUTH = 62;
const PAD = 14;

// Board: deeper for the tank (square), shallower for the circuit (long).
export const BOARD_A: Rect = { x: -142, y: -134, w: 292, d: 254, r: 8 };
export const BOARD_C: Rect = { x: -142, y: -124, w: 292, d: 238, r: 8 };
const SLAB_H = 8;
const FOOT_H = 4;

export const COLS = [-100, -40, 20];
const VDD_Y = -112;
const P_Y = -55;
export const BUS_Y = -5;
const N_Y = 35;
const GND_Y = 56;
const LEV_Y = 100;
const RAIL_X0 = -128;
const RAIL_X1 = 44;
const BUS_X0 = COLS[0];
const BUS_X1 = 132;

// Analogy parts.
const SUP: Rect = { x: -138, y: -130, w: 28, d: 26, r: 1 }; // supply tank on legs
const SUP_Z = 42;
const SUP_H = 30;
const PIPE_Z = 44; // raised supply pipe bottom
const FILL_D = 4; // fill pipes wider than drain pipes (equal flow); slim square pipes as in the two-taps figure
const DRAIN_D = 3;
const TANK: Rect = { x: 96, y: -25, w: 40, d: 40, r: 1 };
const PLINTH: Rect = { x: 93, y: -28, w: 46, d: 46, r: 1 };
const PLINTH_H = 10;
export const TANK_H = 90;
const GUTTER: Rect = { x: -130, y: 50, w: 174, d: 12, r: 1 };
const GUTTER_H = 5;
const LEVER_BOX = (x: number): Rect => ({ x: x - 13, y: LEV_Y - 4, w: 26, d: 8, r: 1 });
const LEVER_H = 16;
const GAUGE_X = (x: number) => x - 23;
const GAUGE_R = 5.6;
const GAUGE_Z = 6.6;

// Circuit parts.
const PMOS_W = 20; // w = 2
const NMOS_W = 10; // w = 1
const DEV_D = 22;
const DEV_H = 6;
const RUN_DX = 18; // EN link run, right of each column

// Stage: board, supply tank, tank and levers at 95 % of the frame width.
const PTS: Vec3[] = [...boxCorners(BOARD_A, -SLAB_H - FOOT_H, 0), ...boxCorners(SUP, 0, SUP_Z + SUP_H + 2), ...boxCorners(PLINTH, 0, PLINTH_H + TANK_H + 2)];
const unit = fitView(PTS, STAGE_W, 4000, { pad: PAD, azimuth: AZIMUTH });
const ys = PTS.map((p) => project(p, unit)[1]);
export const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
export const view = fitView(PTS, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

export const at = (p: Vec3) => project(p, view);
const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
const flat = (pts: Vec2[], z = 0.3) => flatPath(pts, z, view);
export const liftPx = (dz: number) => heightPx(dz, view);

// Text on a front face (+y plane at depth y), upright, centred on height z for a char of size `size`.
export const frontText = (x: number, y: number, z: number, size: number) => {
  const p: Vec3 = [x, y, z - size * 0.36];
  const o = at(p);
  const ax = at([p[0] + 1, p[1], p[2]]);
  const az = at([p[0], p[1], p[2] - 1]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
// Text lying flat on the board, reading along +x.
export const flatText = (x: number, y: number, size: number) => {
  const o = at([x, y + size * 0.36, 0.3]);
  const ax = at([x + 1, y + size * 0.36, 0.3]);
  const ay = at([x, y + size * 0.36 + 1, 0.3]);
  return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(ay[0] - o[0])} ${r3(ay[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
};
const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
const fArc = (y: number, cx: number, cz: number, r: number, a0: number, a1: number, seg = 32): Vec2[] =>
  Array.from({ length: seg + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / seg;
    return at([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });
const fCircle = (y: number, cx: number, cz: number, r: number, seg = 32) => pathD(fArc(y, cx, cz, r, 0, Math.PI * 2, seg), true);

// ---------- Board (rebuilt during the fold) ----------

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const boardRect = (u: number): Rect => ({ x: BOARD_A.x, y: lerp(BOARD_A.y, BOARD_C.y, u), w: BOARD_A.w, d: lerp(BOARD_A.d, BOARD_C.d, u), r: 8 });
export const engraveAt = (u: number) => {
  const b = boardRect(u);
  return frontText(b.x + b.w / 2, b.y + b.d, -SLAB_H / 2, ENGRAVE_SIZE);
};
export function boardSvg(u: number) {
  const b = boardRect(u);
  const rings = rectCorners(b, 7)
    .map(([x, y]) => flatPath(Array.from({ length: 14 }, (_, k): Vec2 => [x + 1.8 * Math.cos((k * Math.PI) / 7), y + 1.8 * Math.sin((k * Math.PI) / 7)]), 0, view, true))
    .join("");
  return {
    halo: prismFill(b, -SLAB_H - FOOT_H, SLAB_H, view),
    feet: rectCorners(b, 14).map(([x, y]) => prism({ x: x - 5, y: y - 5, w: 10, d: 10, r: 5 }, -SLAB_H - FOOT_H, FOOT_H, view, 6, 0.4)),
    slab: prism(b, -SLAB_H, SLAB_H, view, 6, 1.2),
    inset: flatRect(inset(b, 3.5), 0, view),
    rings,
  };
}

// ---------- Analogy: supply tank, pipes, taps, tank, gutter, gauges ----------

export const supply = {
  legs: rectCorners(SUP, 2.5).map(([x, y]) => prism({ x: x - 1.6, y: y - 1.6, w: 3.2, d: 3.2, r: 0.4 }, 0, SUP_Z, view, 2, 0.2)),
  glass: prism(SUP, SUP_Z, SUP_H, view, 3, 0.3),
  lid: prism(inset(SUP, -1), SUP_Z + SUP_H, 2, view, 3, 0.3),
  rect: SUP,
  z: SUP_Z,
  h: SUP_H,
  pipe: pipeX(SUP.x + SUP.w, COLS[2] + FILL_D / 2, VDD_Y, PIPE_Z, FILL_D, view),
};
export const risers = COLS.map((x) => prism({ x: x - FILL_D / 2, y: VDD_Y - FILL_D / 2, w: FILL_D, d: FILL_D, r: 0.4 }, 0, PIPE_Z, view, 2, 0.2));
export const fillPipes = COLS.map((x) => pipeY(VDD_Y + FILL_D / 2, BUS_Y - FILL_D / 2, x, 0, FILL_D, view));
export const header = pipeX(COLS[0] - FILL_D / 2, PLINTH.x, BUS_Y, 0, FILL_D, view);
export const drainPipes = COLS.map((x) => pipeY(BUS_Y + FILL_D / 2, GUTTER.y + 1, x, 0, DRAIN_D, view));
export const gutter = {
  body: prism(GUTTER, 0, GUTTER_H, view, 3, 0.3),
  water: flatRect(inset(GUTTER, 1.6), GUTTER_H - 0.6, view, 3),
  outlet: flatRect({ x: GUTTER.x + 3, y: GUTTER.y + 3, w: 6, d: 6, r: 3 }, GUTTER_H + 0.05, view, 6),
};
// Taps (two-taps figure style): a small block on the pipe, a thin stem, a round wheel cap and a dark handle bar on
// top (along the pipe = open, across = shut). k scales the fill tap up a little.
const twoTap = (x: number, y: number, k: number) => {
  const s = 6 * k;
  const h = 6 * k;
  const top = h + 3 * k;
  return {
    solids: [
      prism({ x: x - s / 2, y: y - s / 2, w: s, d: s, r: 0.8 }, 0, h, view, 3, 0.4),
      cylinder(x, y, 0.8 * k, h, 3 * k, view, 12, 0),
      cylinder(x, y, 3.6 * k, top, 1 * k, view, 28, 0.3),
    ],
    at: [x, y] as Vec2,
    z: top + 1.05 * k,
    r: 5.4 * k,
  };
};
export const fillTaps = COLS.map((x) => twoTap(x, P_Y, 1.25));
export const drainTaps = COLS.map((x) => twoTap(x, N_Y, 1.1));
// Shared tank on its plinth; the maker's plate on the plinth's front face.
const plinthFY = PLINTH.y + PLINTH.d + 0.05;
export const tank = {
  plinth: prism(PLINTH, 0, PLINTH_H, view, 3, 0.4),
  plate: fRect(plinthFY, PLINTH.x + 9, PLINTH.x + PLINTH.w - 9, 1.6, PLINTH_H - 1.6),
  rect: TANK,
  z: PLINTH_H,
};
export const BRAND_SIZE = 5.6;
export const brandAt = frontText(PLINTH.x + PLINTH.w / 2, plinthFY + 0.1, PLINTH_H / 2, BRAND_SIZE);
export const tankGlass = (h: number) => prism(TANK, PLINTH_H, Math.max(0.2, h), view, 3, 0.3);
export const tankTicks = (h: number) =>
  [0.5, 1].map((f) => P([[TANK.x + 2, TANK.y + TANK.d + 0.1, PLINTH_H + h * f], [TANK.x + 9, TANK.y + TANK.d + 0.1, PLINTH_H + h * f]])).join("");
export const tankWater = (h: number, level: number, amp: number, t: number) => waterAt(TANK, PLINTH_H, Math.max(0.05, level * (h - 1.2)), amp, t, 1.3);
export const supplyWater = (level: number, amp: number, t: number) => waterAt(SUP, SUP_Z, level * (SUP_H - 1.2), amp, t, 0.4);
// waterBox draws from z = 0; lift its paths onto the plinth / legs by z0.
function waterAt(rect: Rect, z0: number, level: number, amp: number, t: number, phase: number) {
  const w = waterBox(rect, level, amp, t, phase, view);
  const dy = -liftPx(z0);
  return { ...w, dy };
}
// Warning outline round the tank (front plane, red dashed).
export const tankWarn = fRect(TANK.y + TANK.d + 6, PLINTH.x - 4, PLINTH.x + PLINTH.w + 4, -1, PLINTH_H + TANK_H + 5);
export const tankGhost = (h: number) => prism(TANK, PLINTH_H * 0.2, h, view, 3, 0).outline;

// Gauges: a round dial standing in front of each pair (needle: empty left, half up, full right).
const GY = LEV_Y + 0.05;
export const gauges = COLS.map((x) => {
  const gx = GAUGE_X(x);
  return {
    base: prism({ x: gx - 4.5, y: LEV_Y - 2.5, w: 9, d: 2.5, r: 0.3 }, 0, 1.2, view, 2, 0.1),
    dial: fCircle(GY, gx, GAUGE_Z, GAUGE_R, 36),
    ticks: [Math.PI, Math.PI / 2, 0].map((a) => P([[gx + Math.cos(a) * GAUGE_R * 0.72, GY + 0.1, GAUGE_Z + Math.sin(a) * GAUGE_R * 0.72], [gx + Math.cos(a) * GAUGE_R * 0.95, GY + 0.1, GAUGE_Z + Math.sin(a) * GAUGE_R * 0.95]])).join(""),
    arc: pathD(fArc(GY + 0.1, gx, GAUGE_Z, GAUGE_R * 0.84, 0, Math.PI, 18)),
    hub: at([gx, GY + 0.2, GAUGE_Z]),
    needle: (level: number) => {
      const a = Math.PI * (1 - level);
      return P([[gx, GY + 0.2, GAUGE_Z], [gx + Math.cos(a) * GAUGE_R * 0.78, GY + 0.2, GAUGE_Z + Math.sin(a) * GAUGE_R * 0.78]]);
    },
  };
});

// Flow streak paths (blue drops), on top of each pipe.
const FZ = FILL_D + 0.2;
export const streaks = {
  supply: [SUP.x + SUP.w, ...COLS].slice(0, 3).map((x0, j) => P([[x0, VDD_Y, PIPE_Z + FILL_D + 0.2], [COLS[j], VDD_Y, PIPE_Z + FILL_D + 0.2]])),
  riser: COLS.map((x) => P([[x, VDD_Y + FILL_D / 2 + 0.2, PIPE_Z], [x, VDD_Y + FILL_D / 2 + 0.2, FZ]])),
  fill: COLS.map((x) => flat([[x, VDD_Y + FILL_D / 2], [x, BUS_Y - FILL_D / 2]], FZ)),
  header: COLS.map((x, j) => flat([[x, BUS_Y], [j < 2 ? COLS[j + 1] : PLINTH.x, BUS_Y]], FZ)),
  headerRev: COLS.map((x, j) => flat([[j < 2 ? COLS[j + 1] : PLINTH.x, BUS_Y], [x, BUS_Y]], FZ)),
  drain: COLS.map((x) => flat([[x, BUS_Y + FILL_D / 2], [x, GUTTER.y + 2]], DRAIN_D + 0.2)),
  gutter: COLS.map((x, j) => flat([[x, GUTTER.y + GUTTER.d / 2], [j ? COLS[j - 1] : GUTTER.x + 6, GUTTER.y + GUTTER.d / 2]], GUTTER_H)),
};

// ---------- Shared: lock / enable levers and their links ----------

export type LeverGeo = { x: number };
const PIVOT: (x: number) => Vec3 = (x) => [x, LEV_Y, LEVER_H];
// pos 1 = up (unlocked / EN 1), 0 = forward and down (locked / EN 0).
export const leverTip = (x: number, pos: number): Vec3 => {
  const a = lerp(2.75, 1.6, pos); // angle from +y up toward +z: up while unlocked, laid back and down while locked
  const L = 12;
  return [x, LEV_Y + Math.cos(a) * L, LEVER_H + Math.sin(a) * L];
};
export const leverRod = (x: number, pos: number) => pathD([at(PIVOT(x)), at(leverTip(x, pos))]);
export const knobAt = (x: number, pos: number) => at(leverTip(x, pos));
// Lever knob (two-taps figure style): a short upright cylinder cap on the rod's tip, placed by translateTo.
export const knob = cylinder(0, 0, 3.4, -1.7, 4, view, 20, 0.8);
export const knobTransform = (x: number, pos: number) => translateTo(view, leverTip(x, pos));
export const LABEL_SIZE = 10;
const lfy = LEV_Y + 4 + 0.05;
export const levers = COLS.map((x, i) => ({
  i,
  x,
  box: prism(LEVER_BOX(x), 0, LEVER_H, view, 3, 0.4),
  face: fRect(lfy, x - 11, x + 11, 2, LEVER_H - 2),
  label: frontText(x, lfy + 0.1, LEVER_H / 2, LABEL_SIZE),
  boss: P([[x - 3.5, LEV_Y - 3, LEVER_H + 0.05], [x + 3.5, LEV_Y - 3, LEVER_H + 0.05], [x + 3.5, LEV_Y + 3, LEVER_H + 0.05], [x - 3.5, LEV_Y + 3, LEVER_H + 0.05]], true),
  lock: {
    body: fRect(LEV_Y + 4, x - 6, x + 6, LEVER_H + 16, LEVER_H + 25),
    shackle: pathD(fArc(LEV_Y + 4, x, LEVER_H + 25, 4, 0, Math.PI, 16)),
  },
}));
// EN link: from the lever box's right face, right of it, back over the gutter / GND and the header / bus (raised
// bridges) to the drain tap / NMOS and on to the fill tap / PMOS.
const bridge = (x: number, yc: number, half: number, z: number): [number, number, number][] => [
  [x, yc + half + 3, 0.3],
  [x, yc + half, z],
  [x, yc - half, z],
  [x, yc - half - 3, 0.3],
];
export const enLinks = COLS.map((x) => {
  const rx = x + RUN_DX;
  const pts: Vec3[] = [
    [x + 13, LEV_Y, 6],
    [rx, LEV_Y, 6],
    [rx, LEV_Y - 6, 0.3],
    ...bridge(rx, GND_Y, 5, 4),
    [rx, N_Y, 0.3],
    ...bridge(rx, BUS_Y, 4, 3),
    [rx, P_Y, 0.3],
    [x + PMOS_W / 2 + 0.5, P_Y, 0.3],
  ];
  return { d: P(pts), stubN: flat([[rx, N_Y], [x + NMOS_W / 2 + 0.5, N_Y]]), dot: at([rx, N_Y, 0.3]) };
});

// ---------- Circuit: rails, bus, chips, straps ----------

const railRect = (y: number): Rect => ({ x: RAIL_X0, y: y - 2.5, w: RAIL_X1 - RAIL_X0, d: 5, r: 0.8 });
export const rails = {
  vdd: prism(railRect(VDD_Y), 0, 2.4, view, 2, 0.3),
  gnd: prism(railRect(GND_Y), 0, 2.4, view, 2, 0.3),
};
export const RAIL_SIZE = 10;
export const railText = {
  vdd: flatText(RAIL_X0 - 3, VDD_Y + 8, RAIL_SIZE),
  gnd: flatText(RAIL_X0 - 3, GND_Y - 9, RAIL_SIZE),
};
export const DEV_SIZE = 9.5;
export const devText = {
  pmos: flatText(COLS[0] - PMOS_W / 2 - 3, P_Y - 3.5, DEV_SIZE),
  nmos: flatText(COLS[0] - NMOS_W / 2 - 3, N_Y - 3.5, DEV_SIZE),
};
export const DATA_SIZE = 9.5;
export const dataText = COLS.map((x) => flatText(x - 11, BUS_Y + 16, DATA_SIZE));
export const BUS_SIZE = 10;
export const busText = flatText(BUS_X1 - 2, BUS_Y + 9, BUS_SIZE);
export const busEnd = { cap: at([BUS_X1, BUS_Y, 0.3]) };

const devRect = (x: number, y: number, w: number): Rect => ({ x: x - w / 2, y: y - DEV_D / 2, w, d: DEV_D, r: 1 });
export const chips = COLS.map((x) => ({
  x,
  pmos: prism(devRect(x, P_Y, PMOS_W), 0, DEV_H, view, 3, 0.4),
  pgate: prism({ x: x - PMOS_W / 2 - 1, y: P_Y - 1.4, w: PMOS_W + 2, d: 2.8, r: 0.4 }, DEV_H, 1.2, view, 2, 0.2),
  nmos: prism(devRect(x, N_Y, NMOS_W), 0, DEV_H, view, 3, 0.4),
  ngate: prism({ x: x - NMOS_W / 2 - 1, y: N_Y - 1.4, w: NMOS_W + 2, d: 2.8, r: 0.4 }, DEV_H, 1.2, view, 2, 0.2),
  pin: prism({ x: x - 3.5, y: BUS_Y - 3.5, w: 7, d: 7, r: 0.6 }, 0, 2.4, view, 2, 0.2),
  // Three-state tag floating above the PMOS (front plane).
  tagPlate: fRect(P_Y + 0.05, x - 8, x + 8, 17, 33),
  tagText: frontText(x, P_Y + 0.15, 25, 13),
  readTick: flat([[x - 8, BUS_Y - 3], [x - 8, P_Y + DEV_D / 2 + 4]]),
}));
// Straps (current paths): base trace plus a rust overlay drawn forward (and backward for the bus).
export const straps = COLS.map((x) => ({
  vddP: flat([[x, VDD_Y + 2.5], [x, P_Y - DEV_D / 2]]),
  pPin: flat([[x, P_Y + DEV_D / 2], [x, BUS_Y - 3.5]]),
  pinN: flat([[x, BUS_Y + 3.5], [x, N_Y - DEV_D / 2]]),
  nGnd: flat([[x, N_Y + DEV_D / 2], [x, GND_Y - 2.5]]),
}));
const busXs = [...COLS, BUS_X1];
export const bus = {
  base: flat([[BUS_X0, BUS_Y], [BUS_X1, BUS_Y]]),
  seg: [0, 1, 2].map((j) => ({ fwd: flat([[busXs[j], BUS_Y], [busXs[j + 1], BUS_Y]]), rev: flat([[busXs[j + 1], BUS_Y], [busXs[j], BUS_Y]]) })),
};
// Red dashed warning outline round the fight path: chip 1's PMOS, the bus between, chip 2's NMOS.
const O1 = 13;
const O2 = 8;
export const fightWarn = flatPath(
  [
    [COLS[0] - O1, VDD_Y + 4],
    [COLS[0] + O1, VDD_Y + 4],
    [COLS[0] + O1, BUS_Y - 8],
    [COLS[1] + O2, BUS_Y - 8],
    [COLS[1] + O2, GND_Y + 6],
    [COLS[1] - O2, GND_Y + 6],
    [COLS[1] - O2, BUS_Y + 8],
    [COLS[0] - O1, BUS_Y + 8],
  ],
  0.5,
  view,
  true,
);

// Entrance spark points: board-level corners of the tall parts.
export const contacts: Vec2[] = [
  ...rectCorners(SUP, 2.5).slice(2).map(([x, y]) => at([x, y, 0])),
  at([PLINTH.x, PLINTH.y + PLINTH.d, 0]),
  at([PLINTH.x + PLINTH.w, PLINTH.y + PLINTH.d, 0]),
  ...COLS.map((x) => at([x - 13, LEV_Y + 4, 0])),
  ...COLS.map((x) => at([x + 13, LEV_Y + 4, 0])),
];

// Readout level meter (SVG units).
export const METER = { w: 170, h: 300, tubeX: 98, tubeW: 40, top: 46, bottom: 262 };
