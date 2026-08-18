"use client";

import { SensitivityLevel } from "@/lib/types";
import { SENSITIVITY_LABELS } from "@/lib/sensitivity";

const LEVELS: SensitivityLevel[] = ["low", "medium", "high"];

interface SensitivitySelectorProps {
  value: SensitivityLevel;
  onChange: (level: SensitivityLevel) => void;
}

/** Lets the patient or clinician tune how easily a fixation loss gets flagged. */
export function SensitivitySelector({ value, onChange }: SensitivitySelectorProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {LEVELS.map((level) => {
        const { title, description } = SENSITIVITY_LABELS[level];
        const selected = value === level;
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            aria-pressed={selected}
            className={`rounded-xl border-2 px-5 py-3 text-left transition-colors ${
              selected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="text-base font-medium">{title}</div>
            <div className={`text-sm ${selected ? "opacity-80" : "text-zinc-500 dark:text-zinc-500"}`}>
              {description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
