import { EyeSide, FieldPoint, TestPattern } from "./types";

/**
 * Approximate 24-2 pattern (54 points, 6deg spacing, offset 3deg from both
 * meridians) defined for the right eye (OD). Row widths and the missing
 * temporal point on the y=+-3 rows mirror the real HFA 24-2 layout, which
 * leaves out the point that falls inside the physiological blind spot.
 * This is a training approximation, not a clinical replica.
 */
const OD_ROWS_24_2: { y: number; xs: number[] }[] = [
  { y: 21, xs: [-9, -3, 3, 9] },
  { y: 15, xs: [-15, -9, -3, 3, 9, 15] },
  { y: 9, xs: [-21, -15, -9, -3, 3, 9, 15, 21] },
  { y: 3, xs: [-27, -21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -3, xs: [-27, -21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -9, xs: [-21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -15, xs: [-15, -9, -3, 3, 9, 15] },
  { y: -21, xs: [-9, -3, 3, 9] },
];
const EXTENT_24_2 = 27;

// 10-2 pattern: 2deg spacing, offset 1deg from both meridians (half the spacing, same
// convention as 24-2's 3deg offset), covering the central field. Unlike 24-2, the physiological
// blind spot (~15deg eccentric) falls well outside this range, so no points need excluding for
// it and the pattern is fully symmetric -- eye mirroring is a no-op here, kept for a consistent
// call signature. Clipping the full 10x10 (+-1,+-3,+-5,+-7,+-9) grid to a radius of ~9.06deg
// (sqrt(1^2 + 9^2)) yields exactly the standard 68 test locations.
const STEP_10_2 = [-9, -7, -5, -3, -1, 1, 3, 5, 7, 9];
const RADIUS_10_2 = Math.sqrt(1 * 1 + 9 * 9) + 0.01;
const EXTENT_10_2 = 9.5;

function build24_2(eye: EyeSide): FieldPoint[] {
  const mirror = eye === "OS" ? -1 : 1;
  const points: FieldPoint[] = [];
  for (const row of OD_ROWS_24_2) {
    for (const x of row.xs) {
      points.push({ x: x * mirror, y: row.y });
    }
  }
  return points;
}

function build10_2(): FieldPoint[] {
  const points: FieldPoint[] = [];
  for (const y of STEP_10_2) {
    for (const x of STEP_10_2) {
      if (Math.hypot(x, y) <= RADIUS_10_2) points.push({ x, y });
    }
  }
  return points;
}

/** Physiological blind spot center, in degrees, for the right eye (OD). */
const OD_BLIND_SPOT: FieldPoint = { x: 15.5, y: -1.5 };

export function getGridPoints(eye: EyeSide, pattern: TestPattern): FieldPoint[] {
  return pattern === "10-2" ? build10_2() : build24_2(eye);
}

/** Radius (degrees) the pattern's points span -- used to scale the results visualization. */
export function getPatternExtentDeg(pattern: TestPattern): number {
  return pattern === "10-2" ? EXTENT_10_2 : EXTENT_24_2;
}

export function getBlindSpot(eye: EyeSide): FieldPoint {
  const mirror = eye === "OS" ? -1 : 1;
  return { x: OD_BLIND_SPOT.x * mirror, y: OD_BLIND_SPOT.y };
}
