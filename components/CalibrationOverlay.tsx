"use client";

import { useState } from "react";

// Top row sits lower than a symmetric 6% would put it (94% would suggest), to stay clear of the
// globally-rendered NavControls pill in the top-left corner -- otherwise that point would be
// unclickable on small/mobile viewports, which 10-2 mode specifically targets.
const POINTS: [number, number][] = [
  [0.05, 0.14], [0.5, 0.14], [0.95, 0.14],
  [0.05, 0.5], [0.5, 0.5], [0.95, 0.5],
  [0.05, 0.94], [0.5, 0.94], [0.95, 0.94],
];
const CLICKS_PER_POINT = 5;

interface CalibrationOverlayProps {
  recordClick: (x: number, y: number) => void;
  onDone: () => void;
}

/** 9-point click-to-calibrate UI: WebGazer learns from where the user looks while clicking. */
export function CalibrationOverlay({ recordClick, onDone }: CalibrationOverlayProps) {
  const [counts, setCounts] = useState<number[]>(() => POINTS.map(() => 0));
  const totalClicks = counts.reduce((a, b) => a + b, 0);
  const targetClicks = POINTS.length * CLICKS_PER_POINT;
  const allDone = counts.every((c) => c >= CLICKS_PER_POINT);

  const handleClick = (i: number, e: React.MouseEvent<HTMLButtonElement>) => {
    recordClick(e.clientX, e.clientY);
    setCounts((prev) => prev.map((c, idx) => (idx === i ? c + 1 : c)));
  };

  return (
    <div className="fixed inset-0 bg-zinc-950">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 text-center text-zinc-200">
        <p className="text-lg font-medium">
          Look directly at each dot and click it {CLICKS_PER_POINT} times
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          {totalClicks}/{targetClicks} clicks
        </p>
      </div>
      {POINTS.map(([xPct, yPct], i) => {
        const progress = Math.min(1, counts[i] / CLICKS_PER_POINT);
        return (
          <button
            key={i}
            onClick={(e) => handleClick(i, e)}
            aria-label={`Calibration point ${i + 1}, ${counts[i]} of ${CLICKS_PER_POINT} clicks`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 transition-transform hover:scale-110"
            style={{
              left: `${xPct * 100}%`,
              top: `${yPct * 100}%`,
              width: 28,
              height: 28,
              backgroundColor: progress >= 1 ? "#22c55e" : `rgba(59,130,246,${0.25 + progress * 0.6})`,
            }}
          />
        );
      })}
      {allDone && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={onDone}
            className="rounded-full bg-white px-6 py-3 text-base font-medium text-black"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
