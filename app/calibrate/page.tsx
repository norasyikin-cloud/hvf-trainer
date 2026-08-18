"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CalibrationOverlay } from "@/components/CalibrationOverlay";
import { NavControls } from "@/components/NavControls";
import { useGaze } from "@/lib/gazeStore";
import { useSession } from "@/lib/sessionStore";

// wg.begin() can resolve (camera stream started) even when the face-mesh detector never
// actually produces a prediction -- e.g. a CDN asset failed to load, or the face isn't
// detectable. Without a timeout that failure is silent: the app just looks frozen later,
// with 0% results and no explanation. This surfaces it right where it happens.
const FACE_DETECTION_TIMEOUT_MS = 8000;

export default function CalibratePage() {
  const router = useRouter();
  const { status, startCamera, enableMouseFallback, recordCalibrationClick, hasReceivedCameraSample } = useGaze();
  const { setCameraReady } = useSession();
  const [faceDetectionTimedOut, setFaceDetectionTimedOut] = useState(false);

  useEffect(() => {
    if (status !== "camera" || hasReceivedCameraSample) return;
    const timer = setTimeout(() => setFaceDetectionTimedOut(true), FACE_DETECTION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status, hasReceivedCameraSample]);

  const useMouseInstead = () => {
    enableMouseFallback();
    setCameraReady(false);
    router.push("/setup");
  };

  const finishCalibration = () => {
    setCameraReady(true);
    router.push("/setup");
  };

  const handleStartCamera = () => {
    setFaceDetectionTimedOut(false);
    startCamera();
  };

  if (status === "camera" && hasReceivedCameraSample) {
    return (
      <>
        <NavControls />
        <CalibrationOverlay recordClick={recordCalibrationClick} onDone={finishCalibration} />
      </>
    );
  }

  const waitingForFace = status === "camera" && !faceDetectionTimedOut;

  return (
    <PageShell>
      <NavControls />
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Webcam calibration
      </h1>
      <p className="max-w-lg text-zinc-600 dark:text-zinc-400">
        For the most realistic training, allow camera access so we can watch
        where your eyes are looking in real time. Nothing from your camera
        ever leaves your browser.
      </p>

      {status === "loading" && (
        <p className="text-zinc-500">Starting camera and loading the gaze model…</p>
      )}
      {waitingForFace && (
        <p className="text-zinc-500">
          Looking for your face… make sure you&apos;re centered in frame, well-lit, and both eyes
          are visible.
        </p>
      )}
      {(status === "error" || faceDetectionTimedOut) && (
        <p className="max-w-md text-amber-600 dark:text-amber-400">
          {faceDetectionTimedOut
            ? "We still can't detect your face. Check your lighting, make sure you're centered in frame with both eyes visible, and that no other app is using the camera."
            : "We couldn't access your camera."}{" "}
          You can try again, or practice using your mouse pointer as a stand-in for your gaze.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {!waitingForFace && (
          <button
            onClick={handleStartCamera}
            disabled={status === "loading"}
            className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {faceDetectionTimedOut || status === "error" ? "Try again" : "Allow camera & calibrate"}
          </button>
        )}
        <button
          onClick={useMouseInstead}
          className="rounded-full border border-zinc-400 px-8 py-4 text-base font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
        >
          Skip, use my mouse instead
        </button>
      </div>
    </PageShell>
  );
}
