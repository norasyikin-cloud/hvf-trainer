"use client";

import { FixationTarget } from "./FixationTarget";

interface PauseOverlayProps {
  onResume: () => void;
}

/** Full-screen pause state: stimuli are frozen and fixation alerts are suspended underneath this. */
export function PauseOverlay({ onResume }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-black/95 px-6 text-center">
      <FixationTarget inTolerance />
      <p className="max-w-md text-xl font-semibold text-white">
        Test Paused: Keep your eyes on the center cross before resuming.
      </p>
      <button
        onClick={onResume}
        className="rounded-full bg-white px-10 py-5 text-lg font-semibold text-black transition-colors hover:bg-zinc-200"
      >
        Resume Test
      </button>
    </div>
  );
}
