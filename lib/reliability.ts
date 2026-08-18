import { SessionResult } from "./types";

export interface ReliabilitySummary {
  blindSpotTrialCount: number;
  fixationLosses: number;
  falsePositiveTrialCount: number;
  falsePositives: number;
  falsePositiveRate: number;
  falseNegativeTrialCount: number;
  falseNegatives: number;
  falseNegativeRate: number;
  gazeTimeInTolerancePct: number;
  driftEventCount: number;
  stimulusSeenCount: number;
  stimulusTrialCount: number;
}

export function computeReliability(session: SessionResult): ReliabilitySummary {
  const blindSpotTrials = session.trials.filter((t) => t.trial.kind === "blindSpot");
  const fpTrials = session.trials.filter((t) => t.trial.kind === "falsePositive");
  const fnTrials = session.trials.filter((t) => t.trial.kind === "falseNegative");
  const stimulusTrials = session.trials.filter((t) => t.trial.kind === "stimulus");

  const fixationLosses = blindSpotTrials.filter((t) => t.responded).length;
  const falsePositives = fpTrials.filter((t) => t.responded).length;
  const falseNegatives = fnTrials.filter((t) => !t.responded).length;
  const stimulusSeenCount = stimulusTrials.filter((t) => t.responded).length;

  const gazeTimeInTolerancePct =
    session.gazeSampleCount > 0 ? (session.gazeInToleranceCount / session.gazeSampleCount) * 100 : 100;

  return {
    blindSpotTrialCount: blindSpotTrials.length,
    fixationLosses,
    falsePositiveTrialCount: fpTrials.length,
    falsePositives,
    falsePositiveRate: fpTrials.length > 0 ? (falsePositives / fpTrials.length) * 100 : 0,
    falseNegativeTrialCount: fnTrials.length,
    falseNegatives,
    falseNegativeRate: fnTrials.length > 0 ? (falseNegatives / fnTrials.length) * 100 : 0,
    gazeTimeInTolerancePct,
    driftEventCount: session.driftEvents.length,
    stimulusSeenCount,
    stimulusTrialCount: stimulusTrials.length,
  };
}

export function coachingTips(summary: ReliabilitySummary, usedCameraGaze: boolean): string[] {
  const tips: string[] = [];
  if (summary.fixationLosses > 0) {
    tips.push(
      `You responded to ${summary.fixationLosses} of ${summary.blindSpotTrialCount} blind-spot check trials — a light shouldn't be visible there if you're looking straight at the center dot. Try to resist glancing toward stimuli you sense out of the corner of your eye.`,
    );
  } else if (summary.blindSpotTrialCount > 0) {
    tips.push("Great job — you didn't respond to any blind-spot check trials, a strong sign of steady fixation.");
  }
  if (usedCameraGaze) {
    if (summary.driftEventCount > 6) {
      tips.push(
        `Your gaze drifted off the center target ${summary.driftEventCount} times. Try resting your head against something stable and reminding yourself to hold the center dot even as things flash at the edges.`,
      );
    } else if (summary.gazeTimeInTolerancePct >= 90) {
      tips.push(`You held central fixation for ${summary.gazeTimeInTolerancePct.toFixed(0)}% of the session — excellent control.`);
    }
  }
  if (summary.falsePositiveRate > 20) {
    tips.push("You responded on several trials with no stimulus present — try to only press when you actually see a flash of light.");
  }
  if (summary.falseNegativeRate > 30) {
    tips.push("You missed some easy, already-seen points on repeat — take your time and stay alert throughout the test, not just early on.");
  }
  if (tips.length === 0) {
    tips.push("Solid session overall. Keep practicing to build consistency.");
  }
  return tips;
}
