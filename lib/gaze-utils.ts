import { FieldPoint, ScreenCalibration } from "./types";

/** Reasonable default if the user skips screen calibration: ~96 DPI, arm's length. */
export const DEFAULT_CALIBRATION: ScreenCalibration = {
  pxPerCm: 96 / 2.54,
  viewingDistanceCm: 40,
};

export function degToPx(deg: number, calibration: ScreenCalibration): number {
  return Math.tan((deg * Math.PI) / 180) * calibration.viewingDistanceCm * calibration.pxPerCm;
}

export function pxToDeg(px: number, calibration: ScreenCalibration): number {
  return (Math.atan(px / (calibration.viewingDistanceCm * calibration.pxPerCm)) * 180) / Math.PI;
}

/** Converts a field point (degrees from fixation) to screen pixel coordinates. */
export function fieldPointToScreen(
  point: FieldPoint,
  center: { x: number; y: number },
  calibration: ScreenCalibration,
): { x: number; y: number } {
  return {
    x: center.x + degToPx(point.x, calibration),
    // screen y grows downward; positive field y is "up" in visual field convention
    y: center.y - degToPx(point.y, calibration),
  };
}

export function distancePx(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
