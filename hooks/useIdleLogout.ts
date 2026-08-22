// hooks/useIdleLogout.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useStore";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"];
const WARNING_SECONDS = 60; // show the "still there?" modal this long before logout

/**
 * Logs the user out after `timeoutMinutes` of no mouse/keyboard/touch/scroll
 * activity, showing a warning modal for the last `WARNING_SECONDS` so they
 * can choose to stay. Meant for shared-device dashboards.
 */
export function useIdleLogout(timeoutMinutes: number = 30) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const doLogout = useCallback(() => {
    clearAllTimers();
    logout();
    router.replace("/login?reason=idle");
  }, [clearAllTimers, logout, router]);

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setSecondsLeft(WARNING_SECONDS);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          doLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [doLogout]);

  const resetTimer = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    const idleMs = timeoutMinutes * 60 * 1000 - WARNING_SECONDS * 1000;
    idleTimerRef.current = setTimeout(startWarningCountdown, Math.max(idleMs, 0));
  }, [clearAllTimers, timeoutMinutes, startWarningCountdown]);

  // Called by the "I'm still here" button in the modal
  const stay = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    resetTimer();

    function handleActivity() {
      resetTimer();
    }

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMinutes]);

  return { showWarning, secondsLeft, stay, logoutNow: doLogout };
}