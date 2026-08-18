"use client";

import { useState } from "react";
import { TestPattern } from "@/lib/types";

const OPTIONS: { value: TestPattern; label: string }[] = [
  { value: "10-2", label: "10-2 (Central Field — Recommended for Mobile)" },
  { value: "24-2", label: "24-2 (Full Field — Recommended for Tablet/Desktop)" },
];

const TOOLTIP_TEXT =
  "Use 10-2 mode for smartphones propped up at comfortable reading distance (40cm). " +
  "Use 24-2 mode for tablets or laptops where screen size covers a wider visual angle.";

interface PatternSelectorProps {
  value: TestPattern;
  onChange: (pattern: TestPattern) => void;
}

/** Segmented control for choosing the test grid, with a tap/click-to-reveal clinical tooltip. */
export function PatternSelector({ value, onChange }: PatternSelectorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Test Pattern Select
        </span>
        <button
          type="button"
          onClick={() => setShowTooltip((v) => !v)}
          aria-expanded={showTooltip}
          aria-label="Why does this matter?"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-400 text-xs font-semibold text-zinc-500 dark:border-zinc-600 dark:text-zinc-400"
        >
          i
        </button>
      </div>

      {showTooltip && (
        <p className="rounded-lg bg-zinc-100 p-3 text-left text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {TOOLTIP_TEXT}
        </p>
      )}

      <div className="flex flex-col overflow-hidden rounded-xl border-2 border-zinc-300 dark:border-zinc-700 sm:flex-row">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selected
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "bg-transparent text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
