// Regeneration convoy, still sample (chip-design episode 11). Time unit: video seconds. This is one frozen frame of
// the analogy scene: the shared entrance plays (board rises, parts fall, 3 s), then the frame holds for LOOP seconds.
// Timeline: none (no lever moves, no folds); the only arrivals are the entrance's. The loop ends in its start state
// trivially because nothing moves after the entrance.
// Scene: a two-lane road along x on the board; five supercars 1-5 in the upper (back) lane driving toward -x (car 1
// leads at the left); a small dog crossing just ahead of car 1 toward the back edge; car 1 frozen mid-swerve.

export const LOOP = 3;
export const BRAND = "ROLLIN";

// ---------- Road (board units: x right along the road, y toward the viewer, z up) ----------

export const ROAD = { x0: -127, x1: 127, yB: -52, yF: 52 };
// Lane centres: the upper lane is the back lane (-y).
export const LANE_UP = -26;
// Car scale; cars are supercars of local length 58 (nose a = +29, rear and wing a = -29).
export const K = 0.63;

// Cars: the convoy sits at the right/front end so the first quarter of the road (ahead of car 1) is open tarmac.
// Board x of the car's ground centre, yaw (radians; negative turns the nose toward +y, the front lane).
export const CARS = [
  { id: "c1", num: "1", x: -55, y: LANE_UP + 12, yaw: -0.2 },
  { id: "c2", num: "2", x: -14, y: LANE_UP, yaw: 0 },
  { id: "c3", num: "3", x: 25, y: LANE_UP, yaw: 0 },
  { id: "c4", num: "4", x: 64, y: LANE_UP, yaw: 0 },
  { id: "c5", num: "5", x: 103, y: LANE_UP, yaw: 0 },
] as const;

// The dog: ground point under its body centre, mid-road on the dashed line just ahead of car 1's nose, running toward
// -y (across the road, perpendicular to the cars); body 22 local long; su stretches it along the run (that plane is seen obliquely, so its screen length is short)
// so its screen length is about 60 % of a car's; s scales its height.
export const DOG = { x: -88, y: 2, s: 1.0, su: 1.45 };

// The roadside sign (in-story ROLLIN), on the verge in front of the road.
export const SIGN = { x: 74, y: 60 };
