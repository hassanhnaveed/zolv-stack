"use client";

import { useEffect } from "react";
import { initClarity } from "@/lib/clarity";

/**
 * Initializes Microsoft Clarity on the client after mount.
 * Renders nothing — safe to mount from the root Server Component layout.
 */
export function MicrosoftClarity() {
  useEffect(() => {
    initClarity();
  }, []);

  return null;
}
