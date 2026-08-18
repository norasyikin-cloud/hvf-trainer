"use client";

import { useState } from "react";

const CARD_WIDTH_CM = 8.56; // ISO/IEC 7810 ID-1 (standard credit/bank card)

interface ScreenSizeCalibratorProps {
  onCalibrated: (pxPerCm: number) => void;
  onSkip: () => void;
}

/** Drag a box to match a physical card's width, to derive accurate px-per-cm. */
export function ScreenSizeCalibrator({ onCalibrated, onSkip }: ScreenSizeCalibratorProps) {
  const [widthPx, setWidthPx] = useState(320);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="max-w-md text-center text-zinc-300">
        Hold a credit or bank card up to the screen and drag the slider until
        the box below matches its width exactly. This lets us convert
        degrees of visual field into accurate pixels for your screen.
      </p>
      <div className="h-40 border-2 border-dashed border-blue-400" style={{ width: widthPx }} />
      <input
        type="range"
        min={150}
        max={600}
        value={widthPx}
        onChange={(e) => setWidthPx(Number(e.target.value))}
        className="w-64"
        aria-label="Card width in pixels"
      />
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => onCalibrated(widthPx / CARD_WIDTH_CM)}
          className="rounded-full bg-white px-6 py-3 font-medium text-black"
        >
          This matches
        </button>
        <button
          onClick={onSkip}
          className="rounded-full border border-zinc-500 px-6 py-3 text-zinc-300"
        >
          Skip (use default)
        </button>
      </div>
    </div>
  );
}
