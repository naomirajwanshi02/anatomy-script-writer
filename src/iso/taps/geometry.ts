// Taps world geometry (shared by the taps-and-inverter episodes; first built for chip-design episode 18).
// One board that changes shape at the fold (square for the water rig, long for the circuit); both scenes share one
// stage, each in its own view. x runs right, y toward the viewer (front face +y), z up.
// makeTapsWorld(layout) builds every part from a layout; TAPS_LAYOUT holds episode 18's numbers (the defaults).
// Water rig: a high tank on a four-leg stand (ROLLIN maker's plate) feeds a fill pipe through a round water meter
// (needle dial + two-drum cup counter) to the fill tap over a glass tank; a drain pipe of the same width leaves the tank
// through the drain tap into a floor grate at the front edge. One handle at the left drives both tap wheels by rods.
// Circuit: VDD rail at the back, GND rail at the front, input lever left, PMOS and NMOS valves in one column, output node
// to a glass output tank, a glass-bulb lamp. It sits in its own view at the top of the stage, the readout below it.
import { boxCorners, cylinder, faceMatrix, fitView, flatCircle, flatPath, flatRect, inset, pathD, prism, prismFill, project, rectCorners, translateTo, type Rect, type Vec2, type Vec3, type View } from "../iso-kit";
import { waterBox } from "../analogy/water";
import { bulbParts } from "../react/bulb";

const r3 = (v: number) => Math.round(v * 1e3) / 1e3;
const grow = (r: Rect, by: number): Rect => inset(r, -by);

export const ENGRAVE = "ROLLIN-रोलिन-ROLLIN-रोलिन";
export const ENGRAVE_SIZE = 3.6;

// Every position and size an episode may change. Board units unless noted.
export const TAPS_LAYOUT = {
  stageW: 600, // stage px
  azimuth: 62,
  pad: 6,
  board: { x: -82, y: -66, w: 136, d: 130, r: 5 } as Rect, // water board (square)
  board2: { x: -72, y: -42, w: 150, d: 86, r: 5 } as Rect, // circuit board (long)
  slabH: 6,
  pipeW: 3,
  // Water rig.
  supply: { x: -58, y: -62, w: 40, d: 22, r: 1.2 } as Rect, // high tank
  standH: 76,
  supplyH: 15,
  supplyLevel: 0.75,
  tank: { x: 8, y: -22, w: 30, d: 28, r: 1.2 } as Rect, // glass tank
  plinthH: 14,
  tankH: 32,
  fillZ: 54,
  dropX: -42,
  dropY: -46.5,
  fillTapY: -34,
  spoutY: -12,
  meterR: 8.5,
  meterY1: -39, // dial plane, in front of the stand's front legs
  drainTapY: 20,
  elbowY: 51,
  elbowZ: 8,
  grate: { y: 43, w: 24, d: 16 },
  handle: { x: -66, y: -6, pivotZ: 8, len: 31, swing: 0.95 },
  // Circuit.
  col: -2, // valve column / straps
  vddY: -32,
  gndY: 34,
  railD: 5,
  valve: { w: 20, d: 10, h: 5 },
  pY: -14,
  nY: 14,
  nodeY: 0,
  pinX: -22,
  out2: { x: 36, y: -8, w: 16, d: 16, r: 1.2 } as Rect, // output tank (load C)
  plinth2H: 4,
  out2H: 26,
  lamp: [65, 0] as Vec2,
  lever2: { x: -52, y: 0, pivotZ: 7.5, len: 22, swing: 0.6 },
  ghost: { x: -29, y: 26.5, pivotZ: 3, len: 12 }, // ghost water handle beside the lever
};
export type TapsLayout = typeof TAPS_LAYOUT;

// Convex hull of screen points (monotone chain), for the meter body's silhouette.
function hull(pts: Vec2[]): Vec2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Vec2[] = [];
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Helpers bound to one view.
function kit(view: View) {
  const at = (p: Vec3) => project(p, view);
  const P = (pts: Vec3[], close = false) => pathD(pts.map(at), close);
  // Text standing in a front plane (constant y), reading along +x, baseline centred at height z.
  const frontText = (x: number, y: number, z: number, size: number) => {
    const p: Vec3 = [x, y, z - size * 0.36];
    const o = at(p);
    const ax = at([p[0] + 1, p[1], p[2]]);
    const az = at([p[0], p[1], p[2] - 1]);
    return `matrix(${r3(ax[0] - o[0])} ${r3(ax[1] - o[1])} ${r3(az[0] - o[0])} ${r3(az[1] - o[1])} ${r3(o[0])} ${r3(o[1])})`;
  };
  const fRect = (y: number, x0: number, x1: number, z0: number, z1: number) => P([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);
  const pipeX = (x0: number, x1: number, y: number, zc: number, d: number) => prism({ x: Math.min(x0, x1), y: y - d / 2, w: Math.abs(x1 - x0), d, r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
  const pipeY = (y0: number, y1: number, x: number, zc: number, d: number) => prism({ x: x - d / 2, y: Math.min(y0, y1), w: d, d: Math.abs(y1 - y0), r: 0.4 }, zc - d / 2, d, view, 2, 0.2);
  const pipeZ = (x: number, y: number, z0: number, z1: number, d: number) => cylinder(x, y, d / 2, z0, z1 - z0, view, 16, 0.2);
  // Circle standing in a front plane (constant y).
  const frontCircle = (cx: number, y: number, cz: number, r: number, seg = 40) =>
    Array.from({ length: seg }, (_, i) => {
      const a = (i / seg) * Math.PI * 2;
      return at([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]);
    });
  return { at, P, frontText, fRect, pipeX, pipeY, pipeZ, frontCircle };
}

function boardParts(B: Rect, slab: number, view: View) {
  const { at, frontText } = kit(view);
  return {
    halo: prismFill(B, -slab, slab, view),
    slab: prism(B, -slab, slab, view, 5, 0.8),
    groove: flatRect(inset(B, 3), 0, view),
    screws: rectCorners(B, 5).map(([x, y]) => at([x, y, 0])),
    engraveAt: frontText(B.x + B.w / 2, B.y + B.d, -slab / 2, ENGRAVE_SIZE),
  };
}

export function makeTapsWorld(over: Partial<TapsLayout> = {}) {
  const Lo: TapsLayout = { ...TAPS_LAYOUT, ...over };
  const STAGE_W = Lo.stageW;
  const AZIMUTH = Lo.azimuth;
  const PAD = Lo.pad;
  const BOARD = Lo.board;
  const BOARD2 = Lo.board2;
  const SLAB_H = Lo.slabH;
  const PIPE_W = Lo.pipeW;

  // ---------- Views ----------
  const SUP = Lo.supply;
  const STAND_H = Lo.standH;
  const SUP_H = Lo.supplyH;
  const corners: Vec3[] = [...boxCorners(BOARD, -SLAB_H, 0), ...boxCorners(SUP, 0, STAND_H + SUP_H + 1)];
  const unit: View = fitView(corners, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
  const ys = corners.map((p) => project(p, unit)[1]);
  const STAGE_H = Math.ceil(Math.max(...ys) - Math.min(...ys) + PAD * 2);
  const view = fitView(corners, STAGE_W, STAGE_H, { pad: PAD, azimuth: AZIMUTH });

  const OUT2 = Lo.out2;
  const PLINTH2_H = Lo.plinth2H;
  const OUT2_H = Lo.out2H;
  const LAMP_XY = Lo.lamp;
  const LEV2 = Lo.lever2;
  const corners2: Vec3[] = [...boxCorners(BOARD2, -SLAB_H, 0), [OUT2.x, OUT2.y, PLINTH2_H + OUT2_H + 1], [LAMP_XY[0], LAMP_XY[1], 24], [LEV2.x, LEV2.y, LEV2.pivotZ + LEV2.len + 3]];
  const unit2: View = fitView(corners2, STAGE_W, 10000, { pad: PAD, azimuth: AZIMUTH });
  const ys2 = corners2.map((p) => project(p, unit2)[1]);
  const STAGE2_H = Math.ceil(Math.max(...ys2) - Math.min(...ys2) + PAD * 2);
  const view2 = fitView(corners2, STAGE_W, STAGE2_H, { pad: PAD, azimuth: AZIMUTH });

  // Board: square (m = 0, water view) -> long (m = 1, circuit view); the rect and the view both interpolate.
  const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
  const boardAt = (m: number) => {
    const r: Rect = { x: lerp(BOARD.x, BOARD2.x, m), y: lerp(BOARD.y, BOARD2.y, m), w: lerp(BOARD.w, BOARD2.w, m), d: lerp(BOARD.d, BOARD2.d, m), r: 5 };
    const v: View = { origin: [lerp(view.origin[0], view2.origin[0], m), lerp(view.origin[1], view2.origin[1], m)], scale: lerp(view.scale, view2.scale, m), azimuth: AZIMUTH, elevation: 30 };
    return boardParts(r, SLAB_H, v);
  };
  const board = boardAt(0);

  // ===================================================================================================================
  // Water rig
  // ===================================================================================================================

  const SUP_LEVEL = Lo.supplyLevel;
  const OUT = Lo.tank;
  const PLINTH_H = Lo.plinthH;
  const OUT_H = Lo.tankH;
  const OUT_CX = OUT.x + OUT.w / 2;
  const FILL_Z = Lo.fillZ;
  const DROP_X = Lo.dropX;
  const DROP_Y = Lo.dropY;
  const FILL_TAP_Y = Lo.fillTapY;
  const SPOUT_Y = Lo.spoutY;
  const SPOUT_Z = FILL_Z - 4;
  const MZ = (STAND_H + FILL_Z) / 2;
  const M_R = Lo.meterR;
  const M_Y0 = DROP_Y - 1.5;
  const M_Y1 = Lo.meterY1;
  const CBOX = { x0: DROP_X + 7, x1: DROP_X + 22, z0: MZ - 7.4, z1: MZ + 4.6 };
  const DRAIN_Z = PLINTH_H + 0.5 + PIPE_W / 2;
  const DRAIN_TAP_Y = Lo.drainTapY;
  const ELBOW_Y = Lo.elbowY;
  const ELBOW_Z = Lo.elbowZ;
  const GRATE: Rect = { x: OUT_CX - Lo.grate.w / 2, y: Lo.grate.y, w: Lo.grate.w, d: Lo.grate.d, r: 1 };
  // Handle with a quadrant plate whose arc carries the end marks and a bold middle mark.
  const LEVER = Lo.handle;
  const LBASE: Rect = { x: LEVER.x - 9, y: LEVER.y - 12, w: 18, d: 24, r: 1.4 };

  const { at, P, frontText, fRect, pipeX, pipeY, pipeZ, frontCircle } = kit(view);
  const K = Math.sqrt(1.6) * view.scale; // stage px per board unit (roughly)

  // A tap on a pipe: body block round the pipe, stem, wheel; the handle bar is turned by `open` (0 across, 1 along).
  function tap(x: number, y: number, zc: number, size: number, wheelR: number) {
    const body = prism({ x: x - size / 2, y: y - size / 2, w: size, d: size, r: 0.8 }, zc - size / 2, size, view, 3, 0.4);
    const top = zc + size / 2;
    const stem = cylinder(x, y, 0.8, top, 2, view, 12);
    const wheel = cylinder(x, y, wheelR, top + 2, 1, view, 28, 0.3);
    const z = top + 3.6;
    const bar = (open: number) => {
      const b = Math.PI / 2 - (open * Math.PI) / 2;
      return P([[x - Math.cos(b) * (wheelR + 1.4), y - Math.sin(b) * (wheelR + 1.4), z], [x + Math.cos(b) * (wheelR + 1.4), y + Math.sin(b) * (wheelR + 1.4), z]]);
    };
    return { body, stem, wheel, bar, ring: flatCircle(x, y, wheelR + 3, z - 1.2, view, 28), hub: at([x, y, z]), z, centre: at([x, y, zc]) };
  }
  const fillTap = tap(OUT_CX, FILL_TAP_Y, FILL_Z, 7, 3.8);
  const drainTap = tap(OUT_CX, DRAIN_TAP_Y, DRAIN_Z, PIPE_W + 4, 4.2);

  const legs = rectCorners(SUP, 2.2);
  const supply = {
    backLegs: legs.slice(0, 2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
    frontLegs: legs.slice(2).map(([x, y]) => cylinder(x, y, 1.4, 0, STAND_H - 2, view, 14)),
    feet: legs.map(([x, y]) => cylinder(x, y, 2.4, 0, 1, view, 18, 0.2)),
    brace: fRect(SUP.y + SUP.d - 2.2, legs[2][0], legs[3][0], STAND_H * 0.36, STAND_H * 0.36 + 1.4),
    braceBack: fRect(SUP.y + 2.2, legs[0][0], legs[1][0], STAND_H * 0.36, STAND_H * 0.36 + 1.4),
    platform: prism(grow(SUP, 1), STAND_H - 2, 2, view, 3, 0.3),
    glass: prism(SUP, STAND_H, SUP_H, view, 4, 0.3),
    shift: translateTo(view, [0, 0, STAND_H]),
    // Maker's plate on the front face of the tank.
    plate: fRect(SUP.y + SUP.d + 0.1, SUP.x + 10, SUP.x + SUP.w - 10, STAND_H + 3, STAND_H + 10),
    plateRivets: [SUP.x + 11.2, SUP.x + SUP.w - 11.2].map((x) => at([x, SUP.y + SUP.d + 0.1, STAND_H + 6.5])),
    brandAt: frontText(SUP.x + SUP.w / 2, SUP.y + SUP.d + 0.15, STAND_H + 6.5, 4.6),
  };
  const BRAND_SIZE = 4.6;
  const supplyWater = (amp: number, phase: number) => waterBox(SUP, SUP_LEVEL * SUP_H, amp, 0, phase, view);

  const fill = {
    dropTop: pipeZ(DROP_X, DROP_Y, MZ + M_R - 1, STAND_H, PIPE_W),
    dropLow: pipeZ(DROP_X, DROP_Y, FILL_Z - PIPE_W / 2, MZ - M_R + 1, PIPE_W),
    // Without a meter: one straight drop from the high tank to the fill run.
    drop: pipeZ(DROP_X, DROP_Y, FILL_Z - PIPE_W / 2, STAND_H, PIPE_W),
    run: pipeX(DROP_X - PIPE_W / 2, OUT_CX + PIPE_W / 2, DROP_Y, FILL_Z, PIPE_W),
    down: [pipeY(DROP_Y + PIPE_W / 2, FILL_TAP_Y - 3.5, OUT_CX, FILL_Z, PIPE_W), pipeY(FILL_TAP_Y + 3.5, SPOUT_Y + PIPE_W / 2, OUT_CX, FILL_Z, PIPE_W)],
    spout: cylinder(OUT_CX, SPOUT_Y, PIPE_W / 2 + 0.3, SPOUT_Z, FILL_Z - SPOUT_Z, view, 16, 0.2),
    tagArm: P([[OUT_CX - 3.5, FILL_TAP_Y + 3.6, FILL_Z + 1], [OUT_CX - 6.5, FILL_TAP_Y + 3.6, FILL_Z + 1]]),
    tag: fRect(FILL_TAP_Y + 3.6, OUT_CX - 23.5, OUT_CX - 6.5, FILL_Z - 2.6, FILL_Z + 4.6),
    tagText: frontText(OUT_CX - 15, FILL_TAP_Y + 3.65, FILL_Z + 1, 5),
  };

  // Water meter: body silhouette (hull of back and front rims), dial, ticks, needle, hub; counter box with two drums.
  const pd = (pts: Vec2[]) => pathD(pts, true);
  const dialPoint = (u: number, r: number, turn = 0): Vec3 => {
    const a = ((225 - u * 270 + turn) * Math.PI) / 180;
    return [DROP_X + r * Math.cos(a), M_Y1 + 0.05, MZ + r * Math.sin(a)];
  };
  const cell = (i: number) => {
    const w = (CBOX.x1 - CBOX.x0 - 3) / 2;
    const x0 = CBOX.x0 + 1.5 + i * w;
    return { x0, x1: x0 + w, cx: x0 + w / 2 };
  };
  const DRUM_Z0 = MZ - 2.2;
  const DRUM_Z1 = MZ + 3.4;
  const DRUM_H = DRUM_Z1 - DRUM_Z0;
  const meter = {
    body: pd(hull([...frontCircle(DROP_X, M_Y0, MZ, M_R), ...frontCircle(DROP_X, M_Y1, MZ, M_R)])),
    rim: pd(frontCircle(DROP_X, M_Y1, MZ, M_R)),
    ring: pd(frontCircle(DROP_X + 4, M_Y1 + 0.2, MZ, M_R + 9)),
    dial: pd(frontCircle(DROP_X, M_Y1 + 0.02, MZ, M_R - 1.3)),
    ticks: Array.from({ length: 9 }, (_, i) => P([dialPoint(i / 8, M_R - 2), dialPoint(i / 8, M_R - (i % 4 === 0 ? 4 : 3.1))])).join(""),
    hub: pd(frontCircle(DROP_X, M_Y1 + 0.1, MZ, 1.1, 16)),
    box: prism({ x: CBOX.x0, y: M_Y0 + 1, w: CBOX.x1 - CBOX.x0, d: M_Y1 - M_Y0 - 1, r: 0.6 }, CBOX.z0, CBOX.z1 - CBOX.z0, view, 3, 0.3),
    window: fRect(M_Y1 + 0.05, cell(0).x0, cell(1).x1, DRUM_Z0, DRUM_Z1),
    drums: [0, 1].map((i) => fRect(M_Y1 + 0.08, cell(i).x0 + 0.25, cell(i).x1 - 0.25, DRUM_Z0 + 0.25, DRUM_Z1 - 0.25)),
    cupsAt: frontText((CBOX.x0 + CBOX.x1) / 2, M_Y1 + 0.1, MZ - 5, 3.4),
    centre: at([DROP_X + 6, M_Y1, MZ]),
  };
  // Needle at u (0..1 of its sweep); a rolling drum digit in drum i, offset dz board units (+ = up).
  const needleAt = (u: number) => P([dialPoint(u, 1.8, 180), dialPoint(u, M_R - 2.6)]);
  const drumDigitAt = (i: number, dz: number) => frontText(cell(i).cx, M_Y1 + 0.12, (DRUM_Z0 + DRUM_Z1) / 2 + dz, 4.4);

  const out = {
    plinth: prism(grow(OUT, 1.6), 0, PLINTH_H, view, 3, 0.4),
    glass: prism(OUT, PLINTH_H, OUT_H, view, 10, 0.4),
    glint:
      P([[OUT.x + 4, OUT.y + OUT.d + 0.1, PLINTH_H + OUT_H - 4], [OUT.x + 12, OUT.y + OUT.d + 0.1, PLINTH_H + 6]]) +
      P([[OUT.x + 9, OUT.y + OUT.d + 0.1, PLINTH_H + OUT_H - 3], [OUT.x + 15, OUT.y + OUT.d + 0.1, PLINTH_H + 13]]),
    shift: translateTo(view, [0, 0, PLINTH_H]),
    centre: at([OUT_CX, OUT.y + OUT.d / 2, PLINTH_H + OUT_H / 2]),
  };
  const outWater = (level: number, amp: number, phase: number) => waterBox(OUT, Math.max(0.15, level * OUT_H), amp, 0, phase, view);

  const drain = {
    run: [pipeY(OUT.y + OUT.d - 0.5, DRAIN_TAP_Y - 3.5, OUT_CX, DRAIN_Z, PIPE_W), pipeY(DRAIN_TAP_Y + 3.5, ELBOW_Y + PIPE_W / 2, OUT_CX, DRAIN_Z, PIPE_W)],
    elbow: cylinder(OUT_CX, ELBOW_Y, PIPE_W / 2, ELBOW_Z, DRAIN_Z - PIPE_W / 2 - ELBOW_Z + 0.2, view, 20, 0.2),
    tagArm: P([[OUT_CX - 3.5, DRAIN_TAP_Y + 3.6, DRAIN_Z - 2], [OUT_CX - 6.5, DRAIN_TAP_Y + 3.6, DRAIN_Z - 2]]),
    tag: fRect(DRAIN_TAP_Y + 3.6, OUT_CX - 27.5, OUT_CX - 6.5, DRAIN_Z - 5.6, DRAIN_Z + 1.6),
    tagText: frontText(OUT_CX - 17, DRAIN_TAP_Y + 3.65, DRAIN_Z - 2, 5),
  };
  // One drop falling from the drain tap's spout (u 0..1): from under the tap body down to the board.
  const dripAt = (u: number): Vec2 => {
    const z0 = DRAIN_Z - (PIPE_W + 4) / 2 - 0.6;
    return at([OUT_CX, DRAIN_TAP_Y, Math.max(0.6, z0 * (1 - u * u))]);
  };

  // Floor drain grate at the board's front edge: a low frame with slots; a blue splash where the stream lands.
  const grate = {
    frame: prism(GRATE, 0, 0.9, view, 3, 0.2),
    slots: Array.from({ length: 6 }, (_, i) => {
      const x = GRATE.x + 3.5 + (i * (GRATE.w - 7)) / 5;
      return flatRect({ x: x - 0.8, y: GRATE.y + 3, w: 1.6, d: GRATE.d - 6, r: 0.6 }, 0.92, view, 2);
    }),
    splash: flatCircle(OUT_CX, ELBOW_Y, 3.2, 0.95, view, 24),
    splashRing: flatCircle(OUT_CX, ELBOW_Y, 5, 0.95, view, 28),
    ring: flatRect(grow(GRATE, 2.5), 1, view, 4),
    centre: at([OUT_CX, GRATE.y + GRATE.d / 2, 0]),
  };

  // Falling streams: a blue column (width follows the flow) with drops running down it.
  const STREAM_W = PIPE_W * K * 1.6;
  const fillStream = (level: number) => P([[OUT_CX, SPOUT_Y, SPOUT_Z], [OUT_CX, SPOUT_Y, PLINTH_H + Math.max(0.3, level * OUT_H) + 0.3]]);
  const drainStream = P([[OUT_CX, ELBOW_Y, ELBOW_Z], [OUT_CX, ELBOW_Y, 1]]);

  // Handle: swings in y about its pivot. h 0 = back mark (fill end), 0.5 = middle (straight up), 1 = front (drain end).
  const SWING = LEVER.swing;
  const angle = (h: number) => (2 * h - 1) * SWING;
  const knobPoint = (h: number): Vec3 => [LEVER.x, LEVER.y + Math.sin(angle(h)) * LEVER.len, LEVER.pivotZ + Math.cos(angle(h)) * LEVER.len];
  const tick = (h: number, half: number) => {
    const y = LEVER.y + Math.sin(angle(h)) * 9;
    return flatPath([[LEVER.x - half, y], [LEVER.x + half, y]], 4.05, view);
  };
  // Quadrant plate behind the rod (plane x = QX); its arc is engraved with the end marks and a bold middle mark.
  const QX = LEVER.x - 2.4;
  const arcPt = (h: number, r: number): Vec3 => [QX, LEVER.y + Math.sin(angle(h)) * r, LEVER.pivotZ + Math.cos(angle(h)) * r];
  const ARC_R0 = 12;
  const ARC_R1 = LEVER.len - 2;
  const arcPts = (r: number) => Array.from({ length: 25 }, (_, i) => arcPt(-0.08 + (1.16 * i) / 24, r));
  const lever = {
    base: prism(LBASE, 0, 4, view, 3, 0.4),
    slot: flatRect({ x: LEVER.x - 1.3, y: LEVER.y - 10, w: 2.6, d: 20, r: 1 }, 4, view, 3),
    ticks: tick(0, 5) + tick(1, 5),
    midTick: tick(0.5, 7),
    quadPost: cylinder(QX, LEVER.y, 1.5, 4, LEVER.pivotZ + ARC_R0 - 4, view, 14),
    quadrant: pathD([...arcPts(ARC_R1).map(at), ...arcPts(ARC_R0).reverse().map(at)], true),
    arc: P(arcPts(ARC_R1 - 2.4)),
    arcTicks: P([arcPt(0, ARC_R1 - 4.6), arcPt(0, ARC_R1 - 0.4)]) + P([arcPt(1, ARC_R1 - 4.6), arcPt(1, ARC_R1 - 0.4)]),
    arcMid: P([arcPt(0.5, ARC_R0 + 1), arcPt(0.5, ARC_R1 + 1.2)]),
    pivot: cylinder(LEVER.x, LEVER.y, 2.4, 4, 4.2, view, 18, 0.3),
    knob: cylinder(0, 0, 3.4, -1.7, 3.8, view, 22, 0.6),
    slowmoAt: faceMatrix([LBASE.x - 2, LBASE.y + LBASE.d + 8], 0, view, "x"),
    centre: at([LEVER.x, LEVER.y, LEVER.pivotZ + 10]),
  };
  const leverRod = (h: number) => P([[LEVER.x, LEVER.y, LEVER.pivotZ], knobPoint(h)]);
  const knobAt = (h: number) => translateTo(view, knobPoint(h));
  const knobRing = (h: number) => {
    const [x, y, z] = knobPoint(h);
    return flatCircle(x, y, 7, z, view, 28);
  };

  // Link rods from the knob to both tap wheels (axis-aligned runs in open space); they follow the knob.
  const linksAt = (h: number) => {
    const [kx, ky, kz] = knobPoint(h);
    return {
      fill: P([[kx, ky, kz], [kx + 12, ky, kz], [kx + 12, ky, fillTap.z], [OUT_CX, ky, fillTap.z], [OUT_CX, FILL_TAP_Y + 3.8, fillTap.z]]),
      drain: P([[kx, ky, kz], [kx, DRAIN_TAP_Y, kz], [kx, DRAIN_TAP_Y, drainTap.z], [OUT_CX - 4.2, DRAIN_TAP_Y, drainTap.z]]),
      joints: [at([kx, ky, kz]), at([kx + 12, ky, kz]), at([kx + 12, ky, fillTap.z]), at([OUT_CX, ky, fillTap.z]), at([kx, DRAIN_TAP_Y, kz]), at([kx, DRAIN_TAP_Y, drainTap.z]), fillTap.hub, drainTap.hub],
    };
  };

  // Entrance spark points: handle base, stand feet, tank plinth, grate.
  const contacts: Vec2[] = [...rectCorners(LBASE), ...legs, ...rectCorners(grow(OUT, 1.6)), ...rectCorners(GRATE)].map(([x, y]) => at([x, y, 0]));
  const contactsNoGrate = contacts.slice(0, -4);

  // ===================================================================================================================
  // Circuit
  // ===================================================================================================================

  const COL = Lo.col;
  const VDD_Y = Lo.vddY;
  const GND_Y = Lo.gndY;
  const RAIL_D = Lo.railD;
  const RAIL_X0 = BOARD2.x + 36;
  const RAIL_X1 = BOARD2.x + BOARD2.w - 6;
  const VALVE = Lo.valve;
  const P_Y = Lo.pY;
  const N_Y = Lo.nY;
  const NODE_Y = Lo.nodeY;
  const PIN_X = Lo.pinX;
  const PL2 = grow(OUT2, 1.6);
  const c = kit(view2);
  const face2 = (x: number, y: number) => faceMatrix([x, y], 0, view2, "x");

  const railRect = (y: number): Rect => ({ x: RAIL_X0, y: y - RAIL_D / 2, w: RAIL_X1 - RAIL_X0, d: RAIL_D, r: 0.8 });
  const strap = (y0: number, y1: number) => flatPath([[COL, y0], [COL, y1]], 0, view2);
  const valveParts = (y: number) => {
    const body: Rect = { x: COL - VALVE.w / 2, y: y - VALVE.d / 2, w: VALVE.w, d: VALVE.d, r: 0.4 };
    const gate: Rect = { x: body.x - 1, y: y - 1.3, w: VALVE.w + 2, d: 2.6, r: 0.4 };
    const arm: Rect = { x: PIN_X, y: y - 0.9, w: body.x - PIN_X, d: 1.8, r: 0.3 };
    return { body: prism(body, 0, VALVE.h, view2, 3, 0.4), gate: prism(gate, VALVE.h, 1.2, view2, 2, 0.3), arm: prism(arm, 4.2, 1.2, view2, 2) };
  };
  const circuit = {
    vdd: prism(railRect(VDD_Y), 0, 1.6, view2, 2, 0.3),
    gnd: prism(railRect(GND_Y), 0, 1.6, view2, 2, 0.3),
    vddRing: flatRect(grow(railRect(VDD_Y), 2.4), 1.6, view2, 4),
    gndRing: flatRect(grow(railRect(GND_Y), 2.4), 1.6, view2, 4),
    vddLabel: face2(BOARD2.x + 5, VDD_Y + 2.4),
    gndLabel: face2(BOARD2.x + 5, GND_Y + 2.4),
    pLabel: face2(COL + VALVE.w / 2 + 2.5, P_Y + 2.4),
    nLabel: face2(COL + VALVE.w / 2 + 2.5, N_Y + 2.4),
    // Straps, each drawn in its current direction: VDD -> PMOS -> node -> NMOS -> GND; node <-> tank.
    vddp: strap(VDD_Y + RAIL_D / 2, P_Y - VALVE.d / 2),
    pnode: strap(P_Y + VALVE.d / 2, NODE_Y),
    noden: strap(NODE_Y, N_Y - VALVE.d / 2),
    ngnd: strap(N_Y + VALVE.d / 2, GND_Y - RAIL_D / 2),
    bus: flatPath([[COL, NODE_Y], [PL2.x, NODE_Y]], 0, view2),
    busRev: flatPath([[PL2.x, NODE_Y], [COL, NODE_Y]], 0, view2),
    lampWire: flatPath([[PL2.x + PL2.w, NODE_Y], [LAMP_XY[0] - 6.2, NODE_Y]], 0, view2),
    node: c.at([COL, NODE_Y, 0]),
    gate: flatPath([[LEV2.x + 10, LEV2.y], [PIN_X, LEV2.y]], 0, view2) + flatPath([[PIN_X, P_Y], [PIN_X, N_Y]], 0, view2),
    gateJunction: c.at([PIN_X, LEV2.y, 0]),
    pins: [P_Y, N_Y].map((y) => ({ pin: cylinder(PIN_X, y, 1.4, 0, 7, view2, 16), cap: cylinder(PIN_X, y, 2, 7, 1.2, view2, 18, 0.3) })),
    bubble: flatCircle(PIN_X, P_Y, 3.1, 8.2, view2, 20) + flatCircle(PIN_X, P_Y, 3.1, 7.2, view2, 20),
    p: valveParts(P_Y),
    n: valveParts(N_Y),
  };

  const SWING2 = LEV2.swing;
  const angle2 = (h: number) => (2 * h - 1) * SWING2;
  // Lever: h = Vin / VDD; 0 = knob pulled toward the viewer (front), 1 = pushed back.
  const lev2Point = (h: number): Vec3 => [LEV2.x, LEV2.y - Math.sin(angle2(h)) * LEV2.len, LEV2.pivotZ + Math.cos(angle2(h)) * LEV2.len];
  const tick2 = (h: number, half: number) => {
    const y = LEV2.y - Math.sin(angle2(h)) * 11;
    return flatPath([[LEV2.x - half, y], [LEV2.x + half, y]], 5.05, view2);
  };
  const lever2 = {
    base: prism({ x: LEV2.x - 10, y: LEV2.y - 13, w: 20, d: 26, r: 1.4 }, 0, 5, view2, 3, 0.4),
    slot: flatRect({ x: LEV2.x - 1.4, y: LEV2.y - 11, w: 2.8, d: 22, r: 1.2 }, 5, view2, 3),
    ticks: tick2(0, 6) + tick2(1, 6),
    pivot: cylinder(LEV2.x, LEV2.y, 2.8, 5, 2.5, view2, 18, 0.3),
    knob: cylinder(0, 0, 3.6, -1.8, 4, view2, 22, 0.6),
    mark0: faceMatrix([LEV2.x + 6.6, LEV2.y + 9.4], 5.05, view2, "x"),
    mark1: faceMatrix([LEV2.x + 6.6, LEV2.y - 4], 5.05, view2, "x"),
    vinAt: face2(LEV2.x - 8, LEV2.y + 20),
  };
  const lever2Rod = (h: number) => c.P([[LEV2.x, LEV2.y, LEV2.pivotZ], lev2Point(h)]);
  const knob2At = (h: number) => translateTo(view2, lev2Point(h));
  const knob2Ring = (h: number) => {
    const [x, y, z] = lev2Point(h);
    return flatCircle(x, y, 7, z, view2, 28);
  };

  // Ghost water handle beside the lever (front left corner of the board); swings in y like the water handle.
  const GH = Lo.ghost;
  const ghPoint = (h: number): Vec3 => [GH.x, GH.y + Math.sin(angle(h)) * GH.len, GH.pivotZ + Math.cos(angle(h)) * GH.len];
  const ghost = {
    base: prism({ x: GH.x - 6, y: GH.y - 5, w: 12, d: 9, r: 1 }, 0, 2.4, view2, 3, 0.3),
    knob: cylinder(0, 0, 2.4, -1.2, 2.6, view2, 18, 0.5),
  };
  const ghostRod = (h: number) => c.P([[GH.x, GH.y, GH.pivotZ], ghPoint(h)]);
  const ghostKnobAt = (h: number) => translateTo(view2, ghPoint(h));

  const out2 = {
    plinth: prism(PL2, 0, PLINTH2_H, view2, 3, 0.4),
    glass: prism(OUT2, PLINTH2_H, OUT2_H, view2, 10, 0.4),
    shift: translateTo(view2, [0, 0, PLINTH2_H]),
    ring: flatRect(grow(OUT2, 3.4), PLINTH2_H + OUT2_H, view2, 8),
    loadAt: face2(OUT2.x - 1, OUT2.y + OUT2.d + 7.5),
  };
  const out2Water = (level: number, amp: number, phase: number) => waterBox(OUT2, Math.max(0.15, level * OUT2_H), amp, 0, phase, view2);

  const lamp2 = bulbParts(LAMP_XY, view2, { baseR: 6.2, h: 6 });

  // Fold pairs (screen centres): each water part travels to its circuit part, and back in the fold back.
  const FOLD_PAIRS: Record<string, [Vec2, Vec2]> = {
    supply: [at([SUP.x + SUP.w / 2, SUP.y + SUP.d / 2, STAND_H]), c.at([(RAIL_X0 + RAIL_X1) / 2, VDD_Y, 0])],
    grate: [grate.centre, c.at([(RAIL_X0 + RAIL_X1) / 2, GND_Y, 0])],
    fillTap: [fillTap.centre, c.at([COL, P_Y, 2])],
    drainTap: [drainTap.centre, c.at([COL, N_Y, 2])],
    handle: [lever.centre, c.at([LEV2.x, LEV2.y, 10])],
    tank: [out.centre, c.at([OUT2.x + OUT2.w / 2, OUT2.y + OUT2.d / 2, PLINTH2_H + OUT2_H / 2])],
    meter: [meter.centre, [STAGE_W / 2, STAGE2_H + 60]],
    lamp: [out.centre, c.at([LAMP_XY[0], LAMP_XY[1], 8])],
  };

  return {
    layout: Lo,
    STAGE_W,
    STAGE_H,
    STAGE2_H,
    view,
    view2,
    K,
    boardAt,
    board,
    fillTap,
    drainTap,
    supply,
    BRAND_SIZE,
    supplyWater,
    fill,
    meter,
    needleAt,
    drumDigitAt,
    DRUM_H,
    DIGIT_SIZE: 4.4,
    CUPS_SIZE: 3.4,
    out,
    outWater,
    drain,
    dripAt,
    grate,
    STREAM_W,
    fillStream,
    drainStream,
    lever,
    leverRod,
    knobAt,
    knobRing,
    linksAt,
    contacts,
    contactsNoGrate,
    circuit,
    lever2,
    lever2Rod,
    knob2At,
    knob2Ring,
    ghost,
    ghostRod,
    ghostKnobAt,
    out2,
    out2Water,
    lamp2,
    FOLD_PAIRS,
  };
}
export type TapsWorld = ReturnType<typeof makeTapsWorld>;
export type TapParts = TapsWorld["fillTap"];
export type ValveParts = TapsWorld["circuit"]["p"];
