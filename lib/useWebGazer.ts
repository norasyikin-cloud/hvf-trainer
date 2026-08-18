"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GazePoint } from "./types";
import type { WebGazerInstance } from "webgazer";

export type GazeStatus = "idle" | "loading" | "camera" | "mouse" | "error";

export interface GazeSample extends GazePoint {
  atMs: number;
}

// Must match the installed @mediapipe/face_mesh version (see package-lock.json) so the
// runtime WASM/model assets fetched from the CDN match the API the bundled detector expects.
const MEDIAPIPE_FACE_MESH_VERSION = "0.4.1633559619";
const MEDIAPIPE_FACE_MESH_CDN_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${MEDIAPIPE_FACE_MESH_VERSION}`;

let faceMeshScriptPromise: Promise<void> | null = null;

/** Loads the real MediaPipe FaceMesh script (sets window.FaceMesh) -- see mediapipe-face-mesh-shim.ts. */
function loadFaceMeshScript(): Promise<void> {
  if ((window as unknown as { FaceMesh?: unknown }).FaceMesh) return Promise.resolve();
  if (!faceMeshScriptPromise) {
    faceMeshScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${MEDIAPIPE_FACE_MESH_CDN_BASE}/face_mesh.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load the MediaPipe FaceMesh script"));
      document.head.appendChild(script);
    });
  }
  return faceMeshScriptPromise;
}

/**
 * Loads and drives WebGazer for real-time webcam gaze estimation. Falls back
 * to treating the mouse/pointer position as a pseudo-gaze signal if the
 * camera is unavailable, denied, or WebGazer fails to initialize -- keeps
 * the fixation logic exercisable without a webcam.
 */
export function useWebGazer(onSample: (sample: GazeSample) => void) {
  const [status, setStatus] = useState<GazeStatus>("idle");
  // Tracks whether WebGazer has ever produced a real (non-null) prediction. `wg.begin()` can
  // resolve successfully (camera stream started) even when the underlying face-mesh detector
  // never actually detects a face -- e.g. a CDN asset for the MediaPipe model failed to load,
  // or the eye is occluded. Without this, that failure is silent: `status` still says "camera"
  // but no samples ever arrive, and the whole app just looks frozen with no explanation.
  const [hasReceivedCameraSample, setHasReceivedCameraSample] = useState(false);
  const webgazerRef = useRef<WebGazerInstance | null>(null);
  const onSampleRef = useRef(onSample);
  useEffect(() => {
    onSampleRef.current = onSample;
  });

  const startCamera = useCallback(async () => {
    setStatus("loading");
    setHasReceivedCameraSample(false);
    try {
      await loadFaceMeshScript();
      const mod = await import("webgazer");
      const wg = mod.default;
      webgazerRef.current = wg;
      wg.params.faceMeshSolutionPath = MEDIAPIPE_FACE_MESH_CDN_BASE;
      wg.setRegression("ridge")
        .saveDataAcrossSessions(false)
        .showVideo(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false)
        .showPredictionPoints(false)
        .setGazeListener((data) => {
          if (data) {
            setHasReceivedCameraSample(true);
            onSampleRef.current({ x: data.x, y: data.y, source: "camera", atMs: performance.now() });
          }
        });
      await wg.begin();
      setStatus("camera");
    } catch (err) {
      console.error("WebGazer failed to start, falling back to mouse tracking", err);
      setStatus("error");
    }
  }, []);

  const enableMouseFallback = useCallback(() => {
    setStatus("mouse");
  }, []);

  useEffect(() => {
    if (status !== "mouse") return;
    const handler = (e: PointerEvent) => {
      onSampleRef.current({ x: e.clientX, y: e.clientY, source: "mouse", atMs: performance.now() });
    };
    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, [status]);

  useEffect(() => {
    return () => {
      webgazerRef.current?.end();
    };
  }, []);

  const recordCalibrationClick = useCallback((x: number, y: number) => {
    webgazerRef.current?.recordScreenPosition(x, y, "click");
  }, []);

  // wg.end() alone doesn't stop the camera hardware (WebGazer leaves that to stopVideo(), which
  // it doesn't call itself) -- so the camera indicator light stays on unless both are called.
  // Resets status back to "idle" so a later startCamera() re-acquires a fresh stream cleanly.
  // No-op if there's no camera session to release (e.g. mouse fallback) -- must not disturb that.
  const endCamera = useCallback(() => {
    const wg = webgazerRef.current;
    if (!wg) return;
    try {
      wg.stopVideo();
    } catch {
      // no active stream to stop
    }
    try {
      wg.end();
    } catch {
      // already ended
    }
    webgazerRef.current = null;
    setStatus("idle");
    setHasReceivedCameraSample(false);
  }, []);

  return {
    status,
    startCamera,
    enableMouseFallback,
    recordCalibrationClick,
    hasReceivedCameraSample,
    endCamera,
  };
}
