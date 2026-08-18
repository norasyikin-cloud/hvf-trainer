import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

/** Shared high-contrast chrome for the non-test screens, with the standing disclaimer. */
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        {children}
      </main>
      <footer className="border-t border-zinc-200 px-6 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        HVF Trainer is an educational fixation-training simulation. It is not
        a medical device and does not diagnose or measure your visual field.
        Always follow your eye doctor&apos;s guidance for clinical testing.
      </footer>
    </div>
  );
}
