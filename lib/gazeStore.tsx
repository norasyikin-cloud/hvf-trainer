"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useGazeFixation } from "./useGazeFixation";
import { useSession } from "./sessionStore";

type GazeFixation = ReturnType<typeof useGazeFixation>;

interface GazeContextValue extends GazeFixation {
  /** Whether drift is actively being scored right now (fixation-training / test screens). */
  trackingActive: boolean;
  setTrackingActive: (active: boolean) => void;
}

const GazeContext = createContext<GazeContextValue | null>(null);

/**
 * Owns a single WebGazer/mouse-fallback instance for the whole app so the
 * camera stream (and any calibration) persists across route navigations
 * instead of restarting on every page.
 */
export function GazeProvider({ children }: { children: ReactNode }) {
  const { calibration } = useSession();
  const [trackingActive, setTrackingActive] = useState(false);
  const fixation = useGazeFixation({ calibration, active: trackingActive });

  return (
    <GazeContext.Provider value={{ ...fixation, trackingActive, setTrackingActive }}>
      {children}
    </GazeContext.Provider>
  );
}

export function useGaze(): GazeContextValue {
  const ctx = useContext(GazeContext);
  if (!ctx) throw new Error("useGaze must be used within a GazeProvider");
  return ctx;
}
