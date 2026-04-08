"use client";

import { useEffect } from "react";

/** Calls `handler` when the Escape key is pressed. */
export function useEscapeKey(handler: () => void) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handler]);
}
