"use client";

import { useRouter } from "next/navigation";

interface NavControlsProps {
  /** If set, confirm before navigating away (e.g. an in-progress test would lose its data). */
  confirmMessage?: string;
}

/** Floating Back/Home controls, always reachable, so the patient is never stuck on a screen. */
export function NavControls({ confirmMessage }: NavControlsProps) {
  const router = useRouter();

  const guard = (action: () => void) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    action();
  };

  return (
    <div className="fixed top-4 left-4 z-[70] flex gap-2">
      <button
        onClick={() => guard(() => router.back())}
        aria-label="Go back"
        className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        ← Back
      </button>
      <button
        onClick={() => guard(() => router.push("/"))}
        aria-label="Go to home"
        className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        Home
      </button>
    </div>
  );
}
