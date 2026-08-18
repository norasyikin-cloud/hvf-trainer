import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        HVF Trainer
      </h1>
      <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Practice the skill a real Humphrey Visual Field exam demands: holding
        your eyes still on a center dot while noticing flashes of light in
        your side vision. This trainer watches your gaze with your webcam
        and gives you feedback the moment your eyes wander.
      </p>
      <ul className="w-full max-w-md space-y-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
        <li>1. Calibrate your webcam (or skip and use your mouse instead)</li>
        <li>2. Set up your eye and viewing distance</li>
        <li>3. Practice pure fixation, or run a full simulated test</li>
        <li>4. Review your results and fixation coaching tips</li>
      </ul>
      <Link
        href="/calibrate"
        className="rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Get started
      </Link>
    </PageShell>
  );
}
