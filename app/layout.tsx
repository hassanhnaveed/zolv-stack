import type { Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: "#00D084",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,600&f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
          fetchPriority="low"
        />
      </head>
      <body>
        {children}
        <MicrosoftClarity />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1C2028",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F0F2F5",
              fontFamily: "Satoshi, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
