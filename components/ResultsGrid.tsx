"use client";

import { SessionResult, TestPattern } from "@/lib/types";
import { getPatternExtentDeg } from "@/lib/hvf-grid";

const VIEW = 300;
const MARGIN_DEG = 10;

function getScale(pattern: TestPattern): number {
  return VIEW / (2 * getPatternExtentDeg(pattern) + MARGIN_DEG);
}

// 10-2's 2deg point spacing is much tighter than 24-2's 6deg, so its dots need to be smaller
// to stay legible rather than overlapping.
function getDotRadius(pattern: TestPattern): number {
  return pattern === "10-2" ? 5.5 : 7;
}

interface ResultsGridProps {
  session: SessionResult;
}

/** Grayscale hit/miss map of the test grid, echoing a real HFA printout. */
export function ResultsGrid({ session }: ResultsGridProps) {
  const scale = getScale(session.pattern);
  const dotRadius = getDotRadius(session.pattern);
  const toView = (deg: number) => VIEW / 2 + deg * scale;
  const stimulusResults = session.trials.filter((t) => t.trial.kind === "stimulus");

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={VIEW}
      height={VIEW}
      role="img"
      aria-label={`Visual field hit map (${session.pattern}): light dots were seen, dark dots were missed`}
      className="rounded-lg bg-zinc-800"
    >
      <line x1={VIEW / 2 - 8} y1={VIEW / 2} x2={VIEW / 2 + 8} y2={VIEW / 2} stroke="#71717a" strokeWidth={2} />
      <line x1={VIEW / 2} y1={VIEW / 2 - 8} x2={VIEW / 2} y2={VIEW / 2 + 8} stroke="#71717a" strokeWidth={2} />
      {stimulusResults.map((r) => (
        <circle
          key={r.trial.id}
          cx={toView(r.trial.point.x)}
          cy={toView(-r.trial.point.y)}
          r={dotRadius}
          fill={r.responded ? "#f4f4f5" : "#18181b"}
          stroke="#52525b"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
