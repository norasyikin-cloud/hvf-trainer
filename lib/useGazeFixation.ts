"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebGazer, GazeSample } from "./useWebGazer";
import { degToPx, distancePx } from "./gaze-utils";
import { DriftEvent, GazePoint, ScreenCalibration } from "./types";

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
        inToleranceCountRef.current += 1;
      } else {
        heldSinceMarkRef.current = false;
      }

      if (!ok && !isDriftingRef.current) {
        isDriftingRef.current = true;
        driftStartRef.current = sample.atMs;
      } else if (ok && isDriftingRef.current) {
        isDriftingRef.current = false;
        driftEventsRef.current.push({
          atMs: driftStartRef.current,
          durationMs: sample.atMs - driftStartRef.current,
        });
        setDriftEventCount(driftEventsRef.current.length);
      }

      if (sample.atMs - lastDisplayUpdateRef.current > 80) {
        lastDisplayUpdateRef.current = sample.atMs;
        setDisplayGaze({ x: sample.x, y: sample.y, source: sample.source });
        setInTolerance(ok);
      }
    },
    [active],
  );

  const { status, startCamera, enableMouseFallback, recordCalibrationClick } = useWebGazer(handleSample);

  const beginTrial = useCallback(() => {
    heldSinceMarkRef.current = !isDriftingRef.current;
  }, []);
  const wasFixationHeldThroughout = useCallback(() => heldSinceMarkRef.current, []);

  const reset = useCallback(() => {
    driftEventsRef.current = [];
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
