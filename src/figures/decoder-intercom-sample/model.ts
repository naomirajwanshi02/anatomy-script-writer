// Decoder intercom still sample. Time unit: seconds of video (3 s entrance + loop time); LOOP = 4 s of one frozen
// frame (script 18.4-22.6 s), so it starts and ends in the same state. The timeline is empty (no lever moves,
// arrivals or folds after the entrance); every dot, bell and wire flow is computed below from the three levers.
export const LOOP = 4;

export const BRAND = "ROLLIN";

// The guard's three two-way levers, as address bits: wing (bit 2) A = 0, B = 1; floor (bit 1) G = 0, 1 = 1;
// side (bit 0) L = 0, R = 1. Frozen frame: WING = B, FLOOR = G, SIDE = R (address 101).
export type Sig = "w" | "f" | "s";
export const SIGS: Sig[] = ["w", "f", "s"];
export const LEVERS: Record<Sig, 0 | 1> = { w: 1, f: 0, s: 1 };
export const LEVER_INFO: Record<Sig, { name: string; v0: string; v1: string; tag: string }> = {
  w: { name: "WING", v0: "A", v1: "B", tag: "W" },
  f: { name: "FLOOR", v0: "G", v1: "1", tag: "F" },
  s: { name: "SIDE", v0: "L", v1: "R", tag: "S" },
};

// The eight flats, each with its own three bits.
export type Flat = { id: string; bits: Record<Sig, 0 | 1> };
export const FLATS: Flat[] = [0, 1].flatMap((w) =>
  [0, 1].flatMap((f) =>
    [0, 1].map((s) => ({
      id: `${w ? "B" : "A"}${f ? "1" : "G"}${s ? "R" : "L"}`,
      bits: { w, f, s } as Record<Sig, 0 | 1>,
    })),
  ),
);

// A check dot is filled when that lever matches the flat's own bit; a bell rings only if all three match (AND).
export const dotOn = (flat: Flat, k: Sig) => LEVERS[k] === flat.bits[k];
export const rings = (flat: Flat) => SIGS.every((k) => dotOn(flat, k));
// An address wire carries a 1 (rust flow) when its lever is at its second value.
export const wireOn = (k: Sig) => LEVERS[k] === 1;
