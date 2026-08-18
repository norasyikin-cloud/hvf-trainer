import { SensitivityLevel } from "./types";

export interface SensitivitySettings {
  /** How far (degrees of visual angle) gaze may wander from center before it's "out of tolerance". */
  toleranceDeg: number;
  /**
   * How long a gaze excursion must persist, continuously, before it's treated as a real
   * fixation break rather than sensor noise or a blink (a blink alone can take 300-400ms).
   */
  graceMs: number;
}

// "High" sensitivity intentionally sits close to a blink's duration -- picking it trades away
// some of the blink tolerance for faster real-drift detection, which is a real tradeoff, not
// a free upgrade. Clinicians who want that trade can opt into it explicitly.
export const SENSITIVITY_PRESETS: Record<SensitivityLevel, SensitivitySettings> = {
  low: { toleranceDeg: 6.5, graceMs: 450 },
  medium: { toleranceDeg: 5, graceMs: 300 },
  high: { toleranceDeg: 3.5, graceMs: 180 },
};

export const SENSITIVITY_LABELS: Record<SensitivityLevel, { title: string; description: string }> = {
  low: {
    title: "Low",
    description: "Most forgiving -- fewest false alarms, best for shaky tracking or first-time users.",
  },
  medium: {
    title: "Medium",
    description: "Balanced default -- recommended for most patients.",
  },
  high: {
    title: "High",
    description: "Strictest -- flags smaller, quicker drifts. May also flag slow blinks.",
  },
};
