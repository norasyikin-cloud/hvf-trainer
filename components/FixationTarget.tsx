"use client";

interface FixationTargetProps {
  inTolerance?: boolean;
  size?: number;
}

/** The central cross the patient must keep their gaze locked on. */
export function FixationTarget({ inTolerance = true, size = 28 }: FixationTargetProps) {
  const color = inTolerance ? "#22c55e" : "#ef4444";
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded transition-colors duration-150"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 rounded transition-colors duration-150"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
