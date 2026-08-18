"use client";

interface ProgressHUDProps {
  current: number;
  total: number;
}

export function ProgressHUD({ current, total }: ProgressHUDProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 rounded-full bg-black/40 px-3 py-1 text-xs text-zinc-300">
      Point {Math.min(current + 1, total)} / {total}
    </div>
  );
}
