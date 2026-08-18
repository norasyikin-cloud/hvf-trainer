"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebGazer, GazeSample } from "./useWebGazer";
import { degToPx, distancePx } from "./gaze-utils";
import { DriftEvent, GazePoint, ScreenCalibration } from "./types";

// Default persistence window if the caller doesn't supply one via a sensitivity preset -- long
// enough to absorb a blink (which can take 300-400ms), short enough to still catch real drift.
const DEFAULT_GRACE_MS = 300;

// Low-pass filter weight for smoothing camera gaze samples: each new raw sample only moves the
// smoothed estimate 20% of the way toward it, damping frame-to-frame webcam sensor jitter.
// Mouse-fallback samples aren't noisy in the same way and are passed through unsmoothed.
const EMA_ALPHA = 0.2;

interface Options {
  toleranceDeg?: number;
  /** How long a gaze excursion must persist before it counts as a real fixation break. */
  graceMs?: number;
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
export function useGazeFixation({ toleranceDeg = 4, graceMs = DEFAULT_GRACE_MS, calibration, active }: Options) {
  const [displayGaze, setDisplayGaze] = useState<GazePoint>({ x: 0, y: 0, source: "mouse" });
  const [inTolerance, setInTolerance] = useState(true);
  const [driftEventCount, setDriftEventCount] = useState(0);

  const centerRef = useRef({ x: 0, y: 0 });
  const toleranceRadiusPxRef = useRef(degToPx(toleranceDeg, calibration));
  const graceMsRef = useRef(graceMs);
  const isDriftingRef = useRef(false);
  const driftStartRef = useRef(0);
  /** When the current continuous out-of-tolerance streak began, or null while in tolerance. */
  const outOfToleranceSinceRef = useRef<number | null>(null);
  const driftEventsRef = useRef<DriftEvent[]>([]);
  const sampleCountRef = useRef(0);
  const inToleranceCountRef = useRef(0);
  const heldSinceMarkRef = useRef(true);
  const lastDisplayUpdateRef = useRef(0);
  /** EMA-smoothed running estimate of camera gaze, in screen px. Null until the first sample. */
  const smoothedCameraGazeRef = useRef<{ x: number; y: number } | null>(null);

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

  useEffect(() => {
    graceMsRef.current = graceMs;
  }, [graceMs]);

  const handleSample = useCallback(
    (sample: GazeSample) => {
      if (!active) return;
      sampleCountRef.current += 1;

      // Smooth camera samples (webcam sensor/tracking-model jitter) with a low-pass EMA filter;
      // mouse-fallback samples are already a clean signal and pass through untouched.
      let point: { x: number; y: number } = sample;
      if (sample.source === "camera") {
        const prev = smoothedCameraGazeRef.current;
        point = prev
          ? {
              x: EMA_ALPHA * sample.x + (1 - EMA_ALPHA) * prev.x,
              y: EMA_ALPHA * sample.y + (1 - EMA_ALPHA) * prev.y,
            }
          : { x: sample.x, y: sample.y };
        smoothedCameraGazeRef.current = point;
      }

      const dist = distancePx(point, centerRef.current);
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
        if (outDurationMs >= graceMsRef.current) {
          if (!isDriftingRef.current) {
            isDriftingRef.current = true;
            driftStartRef.current = outOfToleranceSinceRef.current;
          }
          heldSinceMarkRef.current = false;
        } else {
          // Still within the persistence/grace window -- a blink or a single noisy frame,
          // not (yet) treated as a real fixation break.
          inToleranceCountRef.current += 1;
        }
      }

      if (sample.atMs - lastDisplayUpdateRef.current > 80) {
        lastDisplayUpdateRef.current = sample.atMs;
        setDisplayGaze({ x: point.x, y: point.y, source: sample.source });
        setInTolerance(!isDriftingRef.current);
      }
    },
    [active],
  );

  const { status, startCamera, enableMouseFallback, recordCalibrationClick, hasReceivedCameraSample, endCamera } =
    useWebGazer(handleSample);

  const beginTrial = useCallback(() => {
    heldSinceMarkRef.current = !isDriftingRef.current;
  }, []);
  const wasFixationHeldThroughout = useCallback(() => heldSinceMarkRef.current, []);

  const reset = useCallback(() => {
    driftEventsRef.current = [];
    outOfToleranceSinceRef.current = null;
    smoothedCameraGazeRef.current = null;
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
    endCamera,
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
