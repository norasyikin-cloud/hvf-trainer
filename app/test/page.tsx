"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FixationTarget } from "@/components/FixationTarget";
import { StimulusCanvas, ScreenStimulus } from "@/components/StimulusCanvas";
import { ProgressHUD } from "@/components/ProgressHUD";
import { NavControls } from "@/components/NavControls";
import { PauseOverlay } from "@/components/PauseOverlay";
import { useGaze } from "@/lib/gazeStore";
import { useSession } from "@/lib/sessionStore";
import { degToPx, fieldPointToScreen } from "@/lib/gaze-utils";
import { playPresentationTone } from "@/lib/audio";
import {
  buildTrialList,
  engineReducer,
  initEngineState,
  EngineState,
  EngineAction,
  RESPONSE_WINDOW_MS,
  STIMULUS_DURATION_MS,
  randomInterTrialDelay,
} from "@/lib/test-engine";
import { SessionResult } from "@/lib/types";

const STIMULUS_DEGREES = 0.43; // Goldmann III equivalent

export default function TestPage() {
  const router = useRouter();
  const { eye, pattern, calibration, saveSession } = useSession();
  const {
    inTolerance,
    beginTrial,
    wasFixationHeldThroughout,
    reset,
    status,
    getDriftEvents,
    getSampleCount,
    getInToleranceCount,
    setTrackingActive,
  } = useGaze();

  const [started, setStarted] = useState(false);
  const [engine, setEngine] = useState<EngineState>(() => initEngineState([], 0));
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const sessionStartRef = useRef(0);
  const pausedAtRef = useRef(0);
  const totalPausedMsRef = useRef(0);

  const dispatch = useCallback((action: EngineAction) => {
    setEngine((prev) => engineReducer(prev, action));
  }, []);

  useEffect(() => {
    const update = () => setCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => () => setTrackingActive(false), [setTrackingActive]);

  const start = () => {
    reset();
    setTrackingActive(true);
    sessionStartRef.current = Date.now();
    totalPausedMsRef.current = 0;
    setEngine(initEngineState(buildTrialList(eye, pattern), performance.now()));
    setStarted(true);
  };

  const pauseTest = () => {
    if (isPaused || !started || engine.phase === "complete") return;
    pausedAtRef.current = Date.now();
    setTrackingActive(false);
    setIsPaused(true);
  };

  const resumeTest = () => {
    totalPausedMsRef.current += Date.now() - pausedAtRef.current;
    setTrackingActive(true);
    setIsPaused(false);
  };

  // Begin each trial: show/hide the stimulus dot, play the presentation tone, arm the timeout.
  // Keyed on trialStartedAt (unique per trial) rather than index, since the very first trial
  // is already at index 0 both before and after `start()` sets it active. Gated on !isPaused so
  // pausing clears these timers (freezing stimulus generation) and resuming re-arms a full,
  // fresh presentation of the same (interrupted) trial rather than resuming a stale timer.
  useEffect(() => {
    if (!started || engine.phase !== "active" || isPaused) return;
    const trial = engine.trials[engine.index];
    if (!trial) return;

    beginTrial();
    playPresentationTone();

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    if (trial.kind !== "falsePositive") {
      hideTimer = setTimeout(() => dispatch({ type: "HIDE_STIMULUS" }), STIMULUS_DURATION_MS);
    }
    const timeoutTimer = setTimeout(() => {
      dispatch({ type: "TIMEOUT", fixationHeldThroughout: wasFixationHeldThroughout() });
    }, RESPONSE_WINDOW_MS);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      clearTimeout(timeoutTimer);
    };
  }, [started, engine.phase, engine.trialStartedAt, engine.index, engine.trials, isPaused, beginTrial, dispatch, wasFixationHeldThroughout]);

  // Pause briefly between trials (varied, to avoid anticipation), then advance.
  useEffect(() => {
    if (engine.phase !== "interTrial" || isPaused) return;
    const t = setTimeout(() => dispatch({ type: "ADVANCE", now: performance.now() }), randomInterTrialDelay());
    return () => clearTimeout(t);
  }, [engine.phase, isPaused, dispatch]);

  // Listen for the patient's response while a trial is active. Suspended while paused so
  // moving around or talking to a clinician can't accidentally register a response.
  useEffect(() => {
    if (engine.phase !== "active" || isPaused) return;
    const respond = () => {
      dispatch({ type: "RESPOND", now: performance.now(), fixationHeldThroughout: wasFixationHeldThroughout() });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        respond();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", respond);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", respond);
    };
  }, [engine.phase, isPaused, dispatch, wasFixationHeldThroughout]);

  // Session complete: assemble and persist the result, then move to the report.
  useEffect(() => {
    if (!started || engine.phase !== "complete") return;
    const session: SessionResult = {
      eye,
      pattern,
      startedAt: sessionStartRef.current,
      finishedAt: Date.now(),
      trials: engine.results,
      driftEvents: getDriftEvents(),
      gazeSampleCount: getSampleCount(),
      gazeInToleranceCount: getInToleranceCount(),
      usedCameraGaze: status === "camera",
      pausedMs: totalPausedMsRef.current,
    };
    saveSession(session);
    setTrackingActive(false);
    router.push("/results");
  }, [
    started,
    engine.phase,
    engine.results,
    eye,
    pattern,
    status,
    getDriftEvents,
    getSampleCount,
    getInToleranceCount,
    saveSession,
    setTrackingActive,
    router,
  ]);

  if (!started) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <NavControls />
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Ready for the simulated test
        </h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
          Pattern: {pattern} {pattern === "10-2" ? "(central)" : "(full field)"}
        </p>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Keep your eyes on the center cross the entire time. Press{" "}
          <kbd className="rounded bg-zinc-200 px-2 py-1 dark:bg-zinc-800">Space</kbd> or click
          whenever you notice a flash of light anywhere on the screen, even faintly, even at the
          edges — without looking directly at it.
        </p>
        <button
          onClick={start}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Begin test
        </button>
      </div>
    );
  }

  if (engine.phase === "complete") {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-950 text-zinc-300">
        <NavControls />
        Finishing up…
      </div>
    );
  }

  const trial = engine.trials[engine.index];
  const stimulus: ScreenStimulus | null =
    !isPaused && engine.stimulusVisible && trial
      ? {
          ...fieldPointToScreen(trial.point, center, calibration),
          diameterPx: Math.max(8, degToPx(STIMULUS_DEGREES, calibration)),
        }
      : null;

  return (
    <>
      <StimulusCanvas stimulus={stimulus} />
      <FixationTarget inTolerance={inTolerance} />
      <ProgressHUD current={engine.index} total={engine.trials.length} />
      <NavControls confirmMessage="Leaving now will end this test and your progress won't be saved. Continue?" />
      <button
        onClick={pauseTest}
        className="fixed top-4 right-4 z-[70] rounded-full bg-black/60 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        ⏸ Pause
      </button>
      {isPaused && <PauseOverlay onResume={resumeTest} />}
    </>
  );
}
