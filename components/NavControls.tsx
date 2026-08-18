"use client";

import { useRouter } from "next/navigation";
import { useNavOverride } from "@/lib/navOverride";

/**
 * Floating Back/Home controls, rendered once in the root layout so they're always reachable on
 * every screen. Pages with an active session (fixation-training, test) register an override via
 * usePageNavOverride() so both buttons instead exit straight back to /setup, running any
 * necessary cleanup (stopping timers, releasing the camera) first.
 */
export function NavControls() {
  const router = useRouter();
  const overrideRef = useNavOverride();

  const goBack = () => {
    const override = overrideRef.current;
    if (override) {
      override.onBeforeExit?.();
      router.push(override.exitTo);
      return;
    }
    router.back();
  };

  const goHome = () => {
    const override = overrideRef.current;
    if (override) {
      override.onBeforeExit?.();
      router.push(override.exitTo);
      return;
    }
    router.push("/");
  };

  return (
    <div className="fixed top-4 left-4 z-[70] flex gap-2">
      <button
        onClick={goBack}
        aria-label="Go back"
        className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        ← Back
      </button>
      <button
        onClick={goHome}
        aria-label="Go to home"
        className="rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
      >
        Home
      </button>
    </div>
  );
}
