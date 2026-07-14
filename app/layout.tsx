import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fileora.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Fileora — Free Online File Converter | Image to WebP, PDF, HEIC & More",
    template: "%s | Fileora — Free File Converter",
  },
  description:
    "Fileora is a free online file converter. Convert images to WebP, JPG to PDF, HEIC to JPG, merge & compress PDFs. No signup, no watermarks, no limits. Fast & private.",
  keywords: [
    "free file converter",
    "image to webp converter",
    "jpg to pdf online free",
    "heic to jpg converter",
    "webp to jpg",
    "webp to png",
    "pdf merge online free",
    "pdf compressor online",
    "image converter online free",
    "convert png to webp",
    "convert jpg to webp free",
    "image to pdf converter",
    "online file converter no watermark",
    "free image converter no signup",
    "bulk image converter",
    "fileora",
  ],
  authors: [{ name: "Fileora" }],
  creator: "Fileora",
  publisher: "Fileora",
  category: "Technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Fileora",
    title: "Fileora — Free Online File Converter | No Limits, No Watermarks",
    description:
      "Convert images to WebP, JPG to PDF, merge PDFs & more. 100% free, no signup required, no watermarks. Fast & private.",
    images: [{ url: "/og.png?v=3", width: 1200, height: 630, alt: "Fileora — Free File Converter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fileora — Free Online File Converter",
    description: "Convert images & PDFs for free. No limits, no watermarks, no signup.",
    images: ["/og.png?v=3"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: APP_URL },
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.ico?v=3", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/icon-192.png?v=3", sizes: "192x192" }],
  },
  manifest: "/manifest.json?v=3",
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Fileora",
              url: APP_URL,
              description:
                "Free online file converter — convert images to WebP, JPG to PDF, HEIC to JPG, merge & compress PDFs.",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "2048",
              },
              featureList: [
                "Image to WebP conversion",
                "WebP to JPG conversion",
                "WebP to PNG conversion",
                "HEIC to JPG conversion",
                "Image to PDF conversion",
                "PDF merge",
                "PDF compress",
                "Bulk conversion up to 20 files",
                "No file size limit",
                "No watermarks",
                "No registration required",
                "100% private — files never stored",
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
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
