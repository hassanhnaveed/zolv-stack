// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     optimizePackageImports: ["lucide-react", "framer-motion"],
//   },
//   images: {
//     formats: ["image/avif", "image/webp"],
//   },
//   compress: true,
// poweredByHeader: false,
// generateEtags: true,
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           { key: "X-Frame-Options", value: "DENY" },
//           { key: "X-Content-Type-Options", value: "nosniff" },
//           { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
//           { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
//         ],
//       },
//       {
//         source: "/api/(.*)",
//         headers: [
//           { key: "Cache-Control", value: "no-store" },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  turbopack: {
    resolveAlias: {
      "@tensorflow/tfjs-node": "@tensorflow/tfjs",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  async redirects() {
    const toolSlugs = [
      "image-to-webp",
      "image-to-jpg",
      "image-to-png",
      "image-to-avif",
      "image-to-gif",
      "image-to-bmp",
      "image-to-tiff",
      "heic-to-jpg",
      "image-to-pdf",
      "pdf-merge",
      "pdf-compress",
      "pdf-to-jpg",
      "pdf-split",
      "pdf-to-txt",
      "image-enhance",
      "remove-bg",
      "document-to-pdf",
      "document-to-docx",
      "document-to-odt",
      "document-to-rtf",
      "document-to-txt",
      "document-to-html",
      "md-to-pdf",
    ];

    return [
      {
        source: "/convoox",
        destination: "/fileora",
        permanent: true,
      },
      {
        source: "/convoox/:path*",
        destination: "/fileora/:path*",
        permanent: true,
      },
      ...toolSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/fileora/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;