"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { FixationTarget } from "@/components/FixationTarget";
import { useGaze } from "@/lib/gazeStore";
import { usePageNavOverride } from "@/lib/navOverride";

const PRACTICE_SECONDS = 30;

type Phase = "idle" | "running" | "done";

export default function FixationTrainingPage() {
  const {
    inTolerance,
    getSampleCount,
    getInToleranceCount,
    getDriftEvents,
    reset,
    setTrackingActive,
    status,
    endCamera,
  } = useGaze();

  // Back/Home always exit straight to /setup from here, releasing the camera first -- lets a
  // patient who realizes they picked the wrong pattern/sensitivity immediately fix it.
  usePageNavOverride({ exitTo: "/setup", onBeforeExit: endCamera });

  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(PRACTICE_SECONDS);
  const [summary, setSummary] = useState<{ pct: number; drifts: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      setTrackingActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setTrackingActive]);

  const start = () => {
    reset();
    setTrackingActive(true);
    setSecondsLeft(PRACTICE_SECONDS);
    setPhase("running");
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTrackingActive(false);
          const samples = getSampleCount();
          const pct = samples > 0 ? (getInToleranceCount() / samples) * 100 : 0;
          setSummary({ pct, drifts: getDriftEvents().length });
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  if (phase === "running") {
    return (
      <div className="fixed inset-0 bg-zinc-950">
        <FixationTarget inTolerance={inTolerance} />
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-zinc-300">
          <p className="text-sm">Keep your eyes on the cross</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{secondsLeft}s</p>
        </div>
        {status === "mouse" && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500">
            Using mouse position as a gaze stand-in — move your pointer as if it were your eyes.
          </p>
        )}
      </div>
    );
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Fixation training
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Before the full test, build the habit: stare at the center cross for{" "}
        {PRACTICE_SECONDS} seconds. It turns green while you&apos;re on
        target and red the moment your gaze drifts.
      </p>

      {phase === "done" && summary && (
        <div className="w-full max-w-sm space-y-1 rounded-xl border border-zinc-200 p-4 text-left text-sm dark:border-zinc-800">
          <p className="text-zinc-700 dark:text-zinc-300">
            Time on target: <span className="font-semibold">{summary.pct.toFixed(0)}%</span>
          </p>
          <p className="text-zinc-700 dark:text-zinc-300">
            Fixation drifts: <span className="font-semibold">{summary.drifts}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={start}
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {phase === "done" ? "Practice again" : "Start practice"}
        </button>
        {phase === "done" && (
          <Link
            href="/test"
            className="rounded-full border border-zinc-400 px-8 py-4 text-base font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
          >
            Continue to full test
          </Link>
        )}
      </div>
    </PageShell>
  );
}
