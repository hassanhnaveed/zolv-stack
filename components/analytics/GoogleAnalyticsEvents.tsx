"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getMeasurementId, pageView } from "@/lib/analytics/ga";

/**
 * Sends GA4 SPA page views via gtag('config', id, { page_path })
 * whenever the App Router location changes.
 */
export function GoogleAnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const measurementId = getMeasurementId();

  useEffect(() => {
    if (!measurementId) return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    pageView(pagePath);
  }, [pathname, searchParams, measurementId]);

  return null;
}
