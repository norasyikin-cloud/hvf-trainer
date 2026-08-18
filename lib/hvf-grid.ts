import { EyeSide, FieldPoint } from "./types";

/**
 * Approximate 24-2 pattern (54 points, 6deg spacing, offset 3deg from both
 * meridians) defined for the right eye (OD). Row widths and the missing
 * temporal point on the y=+-3 rows mirror the real HFA 24-2 layout, which
 * leaves out the point that falls inside the physiological blind spot.
 * This is a training approximation, not a clinical replica.
 */
const OD_ROWS: { y: number; xs: number[] }[] = [
  { y: 21, xs: [-9, -3, 3, 9] },
  { y: 15, xs: [-15, -9, -3, 3, 9, 15] },
  { y: 9, xs: [-21, -15, -9, -3, 3, 9, 15, 21] },
  { y: 3, xs: [-27, -21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -3, xs: [-27, -21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -9, xs: [-21, -15, -9, -3, 3, 9, 15, 21] },
  { y: -15, xs: [-15, -9, -3, 3, 9, 15] },
  { y: -21, xs: [-9, -3, 3, 9] },
];

/** Physiological blind spot center, in degrees, for the right eye (OD). */
const OD_BLIND_SPOT: FieldPoint = { x: 15.5, y: -1.5 };

export function getGridPoints(eye: EyeSide): FieldPoint[] {
  const mirror = eye === "OS" ? -1 : 1;
  const points: FieldPoint[] = [];
  for (const row of OD_ROWS) {
    for (const x of row.xs) {
      points.push({ x: x * mirror, y: row.y });
    }
  }
  return points;
}

export function getBlindSpot(eye: EyeSide): FieldPoint {
  const mirror = eye === "OS" ? -1 : 1;
  return { x: OD_BLIND_SPOT.x * mirror, y: OD_BLIND_SPOT.y };
}
