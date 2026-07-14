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
};

export default nextConfig;
