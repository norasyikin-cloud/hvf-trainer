"use client";

import { SessionResult } from "@/lib/types";

const VIEW = 300;
const SCALE = VIEW / 64; // fits the +-27deg grid plus margin

function toView(deg: number) {
  return VIEW / 2 + deg * SCALE;
}

interface ResultsGridProps {
  session: SessionResult;
}

/** Grayscale hit/miss map of the 24-2 grid, echoing a real HFA printout. */
export function ResultsGrid({ session }: ResultsGridProps) {
  const stimulusResults = session.trials.filter((t) => t.trial.kind === "stimulus");

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={VIEW}
      height={VIEW}
      role="img"
      aria-label="Visual field hit map: light dots were seen, dark dots were missed"
      className="rounded-lg bg-zinc-800"
    >
      <line x1={VIEW / 2 - 8} y1={VIEW / 2} x2={VIEW / 2 + 8} y2={VIEW / 2} stroke="#71717a" strokeWidth={2} />
      <line x1={VIEW / 2} y1={VIEW / 2 - 8} x2={VIEW / 2} y2={VIEW / 2 + 8} stroke="#71717a" strokeWidth={2} />
      {stimulusResults.map((r) => (
        <circle
          key={r.trial.id}
          cx={toView(r.trial.point.x)}
          cy={toView(-r.trial.point.y)}
          r={7}
          fill={r.responded ? "#f4f4f5" : "#18181b"}
          stroke="#52525b"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
