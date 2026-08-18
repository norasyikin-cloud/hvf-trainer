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
  const webgazerRef = useRef<WebGazerInstance | null>(null);
  const onSampleRef = useRef(onSample);
  useEffect(() => {
    onSampleRef.current = onSample;
  });

  const startCamera = useCallback(async () => {
    setStatus("loading");
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

  return { status, startCamera, enableMouseFallback, recordCalibrationClick };
}
