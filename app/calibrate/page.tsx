"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { CalibrationOverlay } from "@/components/CalibrationOverlay";
import { useGaze } from "@/lib/gazeStore";
import { useSession } from "@/lib/sessionStore";

export default function CalibratePage() {
  const router = useRouter();
  const { status, startCamera, enableMouseFallback, recordCalibrationClick } = useGaze();
  const { setCameraReady } = useSession();

  const useMouseInstead = () => {
    enableMouseFallback();
    setCameraReady(false);
    router.push("/setup");
  };

  const finishCalibration = () => {
    setCameraReady(true);
    router.push("/setup");
  };

  if (status === "camera") {
    return <CalibrationOverlay recordClick={recordCalibrationClick} onDone={finishCalibration} />;
  }

  return (
    <PageShell>
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
      {status === "error" && (
        <p className="max-w-md text-amber-600 dark:text-amber-400">
          We couldn&apos;t access your camera. You can still practice using
          your mouse pointer as a stand-in for your gaze.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={startCamera}
          disabled={status === "loading"}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Allow camera &amp; calibrate
        </button>
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
