export type EyeSide = "OD" | "OS";

/** How forgiving fixation-loss detection is of gaze noise -- see lib/sensitivity.ts. */
export type SensitivityLevel = "low" | "medium" | "high";

/** A point in the visual field, in degrees of visual angle from fixation. x>0 is temporal for OD / nasal for OS. */
export interface FieldPoint {
  x: number;
  y: number;
}

export type TrialKind = "stimulus" | "blindSpot" | "falsePositive" | "falseNegative";

export interface Trial {
  id: string;
  kind: TrialKind;
  point: FieldPoint;
  /** ms the stimulus is shown for */
  durationMs: number;
}

export interface TrialResult {
  trial: Trial;
  responded: boolean;
  reactionTimeMs: number | null;
  fixationHeldThroughout: boolean;
}

export interface DriftEvent {
  atMs: number;
  durationMs: number;
}

export interface SessionResult {
  eye: EyeSide;
  startedAt: number;
  finishedAt: number;
  trials: TrialResult[];
  driftEvents: DriftEvent[];
  gazeSampleCount: number;
  gazeInToleranceCount: number;
  usedCameraGaze: boolean;
}

export interface GazePoint {
  x: number;
  y: number;
  source: "camera" | "mouse";
}

export interface ScreenCalibration {
  /** pixels per centimeter of the physical screen, derived from the card-width calibrator */
  pxPerCm: number;
  /** viewing distance from eye to screen, in cm */
  viewingDistanceCm: number;
}
