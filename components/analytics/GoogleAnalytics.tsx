"use client";

import { Suspense, useState } from "react";
import Script from "next/script";
import { getMeasurementId } from "@/lib/analytics/ga";
import { GoogleAnalyticsEvents } from "@/components/analytics/GoogleAnalyticsEvents";

/**
 * Loads gtag.js and initializes GA4 when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Renders nothing when the env var is missing — safe from the root Server layout.
 *
 * Initial config uses send_page_view: false so App Router navigations are owned
 * exclusively by GoogleAnalyticsEvents (gtag config + page_path).
 */
export function GoogleAnalytics() {
  const measurementId = getMeasurementId();
  const [ready, setReady] = useState(false);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      {ready ? (
        <Suspense fallback={null}>
          <GoogleAnalyticsEvents />
        </Suspense>
      ) : null}
    </>
  );
}
