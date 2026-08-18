import { EyeSide, TestPattern, Trial, TrialResult } from "./types";
import { getBlindSpot, getGridPoints } from "./hvf-grid";

export const STIMULUS_DURATION_MS = 200;
/** How long after stimulus onset a response still counts. */
export const RESPONSE_WINDOW_MS = 1000;
export const INTER_TRIAL_MIN_MS = 500;
export const INTER_TRIAL_MAX_MS = 1200;

const BLIND_SPOT_TRIAL_COUNT = 3;
const FALSE_POSITIVE_TRIAL_COUNT = 3;
const FALSE_NEGATIVE_TRIAL_COUNT = 2;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function spreadIndices(count: number, spanLength: number): number[] {
  const step = spanLength / (count + 1);
  return Array.from({ length: count }, (_, i) => Math.round(step * (i + 1)));
}

/** Builds a randomized, catch-trial-interleaved trial sequence for one eye and test pattern. */
export function buildTrialList(eye: EyeSide, pattern: TestPattern): Trial[] {
  const gridPoints = getGridPoints(eye, pattern);
  const blindSpot = getBlindSpot(eye);

  const stimulusTrials: Trial[] = shuffle(gridPoints).map((point, i) => ({
    id: `stim-${i}`,
    kind: "stimulus",
    point,
    durationMs: STIMULUS_DURATION_MS,
  }));

  // Points closest to fixation are the "easiest" -- reuse them for false-negative retrials.
  const easiestPoints = [...gridPoints]
    .sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y))
    .slice(0, FALSE_NEGATIVE_TRIAL_COUNT);

  const sequence = [...stimulusTrials];

  for (const idx of spreadIndices(BLIND_SPOT_TRIAL_COUNT, sequence.length)) {
    sequence.splice(idx, 0, {
      id: `blind-${idx}`,
      kind: "blindSpot",
      point: blindSpot,
      durationMs: STIMULUS_DURATION_MS,
    });
  }

  for (const idx of spreadIndices(FALSE_POSITIVE_TRIAL_COUNT, sequence.length)) {
    sequence.splice(idx, 0, {
      id: `fp-${idx}`,
      kind: "falsePositive",
      point: { x: 0, y: 0 },
      durationMs: STIMULUS_DURATION_MS,
    });
  }

  // False-negative retrials belong in the back third, after their first presentation.
  const backThirdStart = Math.floor(sequence.length * 0.66);
  easiestPoints.forEach((point, i) => {
    const insertAt = Math.min(sequence.length, backThirdStart + i * 4);
    sequence.splice(insertAt, 0, {
      id: `fn-${i}`,
      kind: "falseNegative",
      point,
      durationMs: STIMULUS_DURATION_MS,
    });
  });

  return sequence;
}

export type EnginePhase = "active" | "interTrial" | "complete";

export interface EngineState {
  trials: Trial[];
  index: number;
  phase: EnginePhase;
  results: TrialResult[];
  trialStartedAt: number;
  /** Whether the stimulus dot is currently drawn (it's only shown for the first STIMULUS_DURATION_MS of the response window). */
  stimulusVisible: boolean;
}

export type EngineAction =
  | { type: "RESPOND"; now: number; fixationHeldThroughout: boolean }
  | { type: "TIMEOUT"; fixationHeldThroughout: boolean }
  | { type: "HIDE_STIMULUS" }
  | { type: "ADVANCE"; now: number };

function stimulusVisibleFor(trial: Trial | undefined): boolean {
  return !!trial && trial.kind !== "falsePositive";
}

/** `now` is captured by the caller (event handler / timer callback), not read inside a reducer. */
export function initEngineState(trials: Trial[], now: number): EngineState {
  return {
    trials,
    index: 0,
    phase: trials.length > 0 ? "active" : "complete",
    results: [],
    trialStartedAt: now,
    stimulusVisible: stimulusVisibleFor(trials[0]),
  };
}

function recordResult(
  state: EngineState,
  responded: boolean,
  reactionTimeMs: number | null,
  fixationHeldThroughout: boolean,
): EngineState {
  const trial = state.trials[state.index];
  const result: TrialResult = { trial, responded, reactionTimeMs, fixationHeldThroughout };
  return { ...state, results: [...state.results, result], phase: "interTrial" };
}

export function engineReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case "RESPOND": {
      if (state.phase !== "active") return state;
      const reactionTimeMs = action.now - state.trialStartedAt;
      return recordResult(state, true, reactionTimeMs, action.fixationHeldThroughout);
    }
    case "TIMEOUT": {
      if (state.phase !== "active") return state;
      return recordResult(state, false, null, action.fixationHeldThroughout);
    }
    case "HIDE_STIMULUS": {
      if (state.phase !== "active") return state;
      return { ...state, stimulusVisible: false };
    }
    case "ADVANCE": {
      if (state.phase !== "interTrial") return state;
      const nextIndex = state.index + 1;
      if (nextIndex >= state.trials.length) {
        return { ...state, index: nextIndex, phase: "complete" };
      }
      return {
        ...state,
        index: nextIndex,
        phase: "active",
        trialStartedAt: action.now,
        stimulusVisible: stimulusVisibleFor(state.trials[nextIndex]),
      };
    }
    default:
      return state;
  }
}

export function randomInterTrialDelay(): number {
  return INTER_TRIAL_MIN_MS + Math.random() * (INTER_TRIAL_MAX_MS - INTER_TRIAL_MIN_MS);
}
