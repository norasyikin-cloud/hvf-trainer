"use client";

export interface ScreenStimulus {
  x: number;
  y: number;
  diameterPx: number;
}

interface StimulusCanvasProps {
  stimulus: ScreenStimulus | null;
}

/** Dim gray field (approximating the HFA bowl) that flashes a stimulus dot. */
export function StimulusCanvas({ stimulus }: StimulusCanvasProps) {
  return (
    <div className="fixed inset-0 bg-[#3a3a3a]">
      {stimulus && (
        <div
          className="absolute rounded-full bg-white"
          style={{
            left: stimulus.x - stimulus.diameterPx / 2,
            top: stimulus.y - stimulus.diameterPx / 2,
            width: stimulus.diameterPx,
            height: stimulus.diameterPx,
            boxShadow: "0 0 6px 2px rgba(255,255,255,0.5)",
          }}
        />
      )}
    </div>
  );
}
