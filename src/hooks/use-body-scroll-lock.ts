"use client";

import { useEffect } from "react";

/** Locks body scroll while mounted, restores on unmount. */
export function useBodyScrollLock() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
}
