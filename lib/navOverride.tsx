"use client";

import { createContext, useContext, useEffect, useRef, ReactNode, RefObject } from "react";

export interface NavOverride {
  /** Both Back and Home route here instead of their normal destinations. */
  exitTo: string;
  /** Run synchronously, before navigating away (e.g. to stop timers / release the camera). */
  onBeforeExit?: () => void;
}

const NavOverrideRefContext = createContext<RefObject<NavOverride | null> | null>(null);

/**
 * Holds the current page's Back/Home override (if any) in a ref rather than state, so
 * registering it doesn't re-render the single, globally-rendered NavControls on every page
 * render -- NavControls only reads it at click time.
 */
export function NavOverrideProvider({ children }: { children: ReactNode }) {
  const overrideRef = useRef<NavOverride | null>(null);
  return <NavOverrideRefContext.Provider value={overrideRef}>{children}</NavOverrideRefContext.Provider>;
}

function useNavOverrideRef(): RefObject<NavOverride | null> {
  const ctx = useContext(NavOverrideRefContext);
  if (!ctx) throw new Error("useNavOverrideRef must be used within a NavOverrideProvider");
  return ctx;
}

/** Read-only access for NavControls itself. */
export function useNavOverride(): RefObject<NavOverride | null> {
  return useNavOverrideRef();
}

/**
 * Registers a Back/Home override for as long as the calling page is mounted -- both buttons
 * will exit to `exitTo`, running `onBeforeExit` first. Pass null to not override (equivalent to
 * not calling this hook at all, just easier to make conditional).
 */
export function usePageNavOverride(override: NavOverride | null) {
  const overrideRef = useNavOverrideRef();
  // Keep a stable callback wrapper so the effect below doesn't need onBeforeExit in its deps
  // (callers pass a fresh function each render; only exitTo identity should matter).
  const latestOnBeforeExit = useRef(override?.onBeforeExit);
  useEffect(() => {
    latestOnBeforeExit.current = override?.onBeforeExit;
  });

  const exitTo = override?.exitTo ?? null;

  useEffect(() => {
    if (exitTo === null) return;
    overrideRef.current = { exitTo, onBeforeExit: () => latestOnBeforeExit.current?.() };
    return () => {
      overrideRef.current = null;
    };
  }, [exitTo, overrideRef]);
}
