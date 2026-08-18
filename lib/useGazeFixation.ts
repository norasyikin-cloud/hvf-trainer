"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebGazer, GazeSample } from "./useWebGazer";
import { degToPx, distancePx } from "./gaze-utils";
import { DriftEvent, GazePoint, ScreenCalibration } from "./types";

// A blink briefly occludes the eye, which makes WebGazer's face-landmark tracking spit out a
// wild gaze coordinate for a frame or two while the eyelid is closing/opening. Requiring the
// gaze to stay outside tolerance for this long before treating it as a real fixation break
// absorbs that blip without needing explicit blink detection -- patients can blink normally.
const BLINK_GRACE_MS = 300;

interface Options {
  toleranceDeg?: number;
  calibration: ScreenCalibration;
  /** Only track drift while true -- e.g. skip it on non-test screens. */
  active: boolean;
}

/**
 * Tracks whether the user's gaze (camera or mouse-fallback) is staying
 * within `toleranceDeg` of screen center. Sampling runs on refs to avoid
 * re-rendering on every gaze frame; the returned `gaze`/`inTolerance`
 * state is throttled for the on-screen feedback indicator only.
 */
export function useGazeFixation({ toleranceDeg = 4, calibration, active }: Options) {
  const [displayGaze, setDisplayGaze] = useState<GazePoint>({ x: 0, y: 0, source: "mouse" });
  const [inTolerance, setInTolerance] = useState(true);
  const [driftEventCount, setDriftEventCount] = useState(0);

  const centerRef = useRef({ x: 0, y: 0 });
  const toleranceRadiusPxRef = useRef(degToPx(toleranceDeg, calibration));
  const isDriftingRef = useRef(false);
  const driftStartRef = useRef(0);
  /** When the current continuous out-of-tolerance streak began, or null while in tolerance. */
  const outOfToleranceSinceRef = useRef<number | null>(null);
  const driftEventsRef = useRef<DriftEvent[]>([]);
  const sampleCountRef = useRef(0);
  const inToleranceCountRef = useRef(0);
  const heldSinceMarkRef = useRef(true);
  const lastDisplayUpdateRef = useRef(0);

  useEffect(() => {
    const updateCenter = () => {
      centerRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  useEffect(() => {
    toleranceRadiusPxRef.current = degToPx(toleranceDeg, calibration);
  }, [toleranceDeg, calibration]);

  const handleSample = useCallback(
    (sample: GazeSample) => {
      if (!active) return;
      sampleCountRef.current += 1;
      const dist = distancePx(sample, centerRef.current);
      const ok = dist <= toleranceRadiusPxRef.current;

      if (ok) {
        outOfToleranceSinceRef.current = null;
        inToleranceCountRef.current += 1;
        if (isDriftingRef.current) {
          isDriftingRef.current = false;
          driftEventsRef.current.push({
            atMs: driftStartRef.current,
            durationMs: sample.atMs - driftStartRef.current,
          });
          setDriftEventCount(driftEventsRef.current.length);
        }
      } else {
        if (outOfToleranceSinceRef.current === null) {
          outOfToleranceSinceRef.current = sample.atMs;
        }
        const outDurationMs = sample.atMs - outOfToleranceSinceRef.current;
        if (outDurationMs >= BLINK_GRACE_MS) {
          if (!isDriftingRef.current) {
            isDriftingRef.current = true;
            driftStartRef.current = outOfToleranceSinceRef.current;
          }
          heldSinceMarkRef.current = false;
        } else {
          // Still within the blink grace window -- don't penalize it yet.
          inToleranceCountRef.current += 1;
        }
      }

      if (sample.atMs - lastDisplayUpdateRef.current > 80) {
        lastDisplayUpdateRef.current = sample.atMs;
        setDisplayGaze({ x: sample.x, y: sample.y, source: sample.source });
        setInTolerance(!isDriftingRef.current);
      }
    },
    [active],
  );

  const { status, startCamera, enableMouseFallback, recordCalibrationClick, hasReceivedCameraSample } =
    useWebGazer(handleSample);

  const beginTrial = useCallback(() => {
    heldSinceMarkRef.current = !isDriftingRef.current;
  }, []);
  const wasFixationHeldThroughout = useCallback(() => heldSinceMarkRef.current, []);

  const reset = useCallback(() => {
    driftEventsRef.current = [];
    outOfToleranceSinceRef.current = null;
    sampleCountRef.current = 0;
    inToleranceCountRef.current = 0;
    isDriftingRef.current = false;
    heldSinceMarkRef.current = true;
    setDriftEventCount(0);
    setInTolerance(true);
  }, []);

  return {
    status,
    startCamera,
    enableMouseFallback,
    recordCalibrationClick,
    hasReceivedCameraSample,
    gaze: displayGaze,
    inTolerance,
    driftEventCount,
    getDriftEvents: useCallback(() => driftEventsRef.current, []),
    getSampleCount: useCallback(() => sampleCountRef.current, []),
    getInToleranceCount: useCallback(() => inToleranceCountRef.current, []),
    beginTrial,
    wasFixationHeldThroughout,
    reset,
    usedCamera: status === "camera",
  };
}
