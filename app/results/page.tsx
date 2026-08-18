"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ResultsGrid } from "@/components/ResultsGrid";
import { useSession } from "@/lib/sessionStore";
import { computeReliability, coachingTips } from "@/lib/reliability";

export default function ResultsPage() {
  const { lastSession } = useSession();

  if (!lastSession) {
    return (
      <PageShell>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          No session yet
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          Run a simulated test first and your results will show up here.
        </p>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Start a session
        </Link>
      </PageShell>
    );
  }

  const summary = computeReliability(lastSession);
  const tips = coachingTips(summary, lastSession.usedCameraGaze);
  const durationSec = Math.round((lastSession.finishedAt - lastSession.startedAt) / 1000);

  return (
    <PageShell>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Your results — {lastSession.eye === "OD" ? "right eye" : "left eye"}
      </h1>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
        Pattern: {lastSession.pattern ?? "24-2"}
      </p>

      <ResultsGrid session={{ ...lastSession, pattern: lastSession.pattern ?? "24-2" }} />

      <div className="grid w-full max-w-md grid-cols-2 gap-3 text-left text-sm">
        <Stat label="Points seen" value={`${summary.stimulusSeenCount}/${summary.stimulusTrialCount}`} />
        <Stat label="Session length" value={`${durationSec}s`} />
        <Stat label="Fixation losses" value={`${summary.fixationLosses}/${summary.blindSpotTrialCount}`} />
        <Stat label="Gaze on target" value={`${summary.gazeTimeInTolerancePct.toFixed(0)}%`} />
        <Stat label="False positives" value={`${summary.falsePositives}/${summary.falsePositiveTrialCount}`} />
        <Stat label="False negatives" value={`${summary.falseNegatives}/${summary.falseNegativeTrialCount}`} />
      </div>

      <div className="w-full max-w-md space-y-2 rounded-xl border border-zinc-200 p-4 text-left dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Coaching notes</h2>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/fixation-training"
          className="rounded-full border border-zinc-400 px-8 py-4 text-base font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
        >
          Practice fixation only
        </Link>
        <Link
          href="/test"
          className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Retake test
        </Link>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-500">{label}</p>
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
