"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { EyeSide, ScreenCalibration, SensitivityLevel, SessionResult } from "./types";
import { DEFAULT_CALIBRATION } from "./gaze-utils";

const STORAGE_KEY = "hvf-trainer:last-session";

interface SessionContextValue {
  eye: EyeSide;
  setEye: (eye: EyeSide) => void;
  calibration: ScreenCalibration;
  setCalibration: (c: ScreenCalibration) => void;
  sensitivity: SensitivityLevel;
  setSensitivity: (s: SensitivityLevel) => void;
  lastSession: SessionResult | null;
  saveSession: (s: SessionResult) => void;
  cameraReady: boolean;
  setCameraReady: (v: boolean) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): SessionResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionResult) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [eye, setEye] = useState<EyeSide>("OD");
  const [calibration, setCalibration] = useState<ScreenCalibration>(DEFAULT_CALIBRATION);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>("medium");
  const [lastSession, setLastSession] = useState<SessionResult | null>(readStoredSession);
  const [cameraReady, setCameraReady] = useState(false);

  const saveSession = useCallback((session: SessionResult) => {
    setLastSession(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage quota/availability errors
    }
  }, []);

  return (
    <SessionContext.Provider
      value={{
        eye,
        setEye,
        calibration,
        setCalibration,
        sensitivity,
        setSensitivity,
        lastSession,
        saveSession,
        cameraReady,
        setCameraReady,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
