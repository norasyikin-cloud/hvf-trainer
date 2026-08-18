"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ScreenSizeCalibrator } from "@/components/ScreenSizeCalibrator";
import { SensitivitySelector } from "@/components/SensitivitySelector";
import { useSession } from "@/lib/sessionStore";
import { EyeSide } from "@/lib/types";

type Step = "eye" | "distance" | "sensitivity" | "screen";

export default function SetupPage() {
  const router = useRouter();
  const { eye, setEye, calibration, setCalibration, sensitivity, setSensitivity } = useSession();
  const [step, setStep] = useState<Step>("eye");
  const [distanceCm, setDistanceCm] = useState(calibration.viewingDistanceCm);

  const finish = (pxPerCm: number) => {
    setCalibration({ pxPerCm, viewingDistanceCm: distanceCm });
    router.push("/fixation-training");
  };

  if (step === "eye") {
    return (
      <PageShell>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Which eye are you testing?
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          A real Humphrey exam patches the other eye completely, since each
          eye is tested on its own. Keep both eyes open here instead — the
          webcam tracker needs to see both to follow your gaze, so this
          selection just picks which eye&apos;s blind-spot location and field
          pattern to simulate for practice.
        </p>
        <div className="flex gap-4">
          {(["OD", "OS"] as EyeSide[]).map((side) => (
            <button
              key={side}
              onClick={() => setEye(side)}
              className={`rounded-2xl border-2 px-8 py-6 text-lg font-medium transition-colors ${
                eye === side
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {side === "OD" ? "Right eye (OD)" : "Left eye (OS)"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep("distance")}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Continue
        </button>
      </PageShell>
    );
  }

  if (step === "distance") {
    return (
      <PageShell>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          How far are you sitting from the screen?
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Measure roughly, in centimeters. This lets us size and place the
          light stimuli at the correct degrees of your visual field.
        </p>
        <div className="flex items-center gap-3 text-xl">
          <input
            type="number"
            min={20}
            max={100}
            value={distanceCm}
            onChange={(e) => setDistanceCm(Number(e.target.value))}
            className="w-28 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-center dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span className="text-zinc-600 dark:text-zinc-400">cm</span>
        </div>
        <button
          onClick={() => setStep("sensitivity")}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Continue
        </button>
      </PageShell>
    );
  }

  if (step === "sensitivity") {
    return (
      <PageShell>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Fixation-loss sensitivity
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Controls how easily a gaze drift gets flagged as a fixation loss.
          If the indicator flags you too often, try Low. A clinician wanting
          stricter tracking can choose High.
        </p>
        <SensitivitySelector value={sensitivity} onChange={setSensitivity} />
        <button
          onClick={() => setStep("screen")}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Continue
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Screen size calibration
      </h1>
      <ScreenSizeCalibrator onCalibrated={finish} onSkip={() => finish(calibration.pxPerCm)} />
    </PageShell>
  );
}
