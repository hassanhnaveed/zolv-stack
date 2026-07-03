import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ImageEnhancer } from "../../../components/tools/ImageEnhancer";

export const metadata: Metadata = {
  title: "Enhance Image — Free Online | Improve Image Quality | Convoox",
  description:
    "Enhance image quality with AI. Sharpen blurry images, upscale resolution 2x, boost clarity. Free online tool with before/after comparison. No signup required.",
  keywords:
    "ai image enhancer, sharpen image online free, upscale image, improve image quality, hd image enhancer online",
  alternates: { canonical: "https://convoox.netlify.app/image-enhance" },
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "64px 24px 80px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 500,
              height: 300,
              background:
                "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 40,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                ✨
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(28px, 4vw, 44px)",
                    fontWeight: 800,
                    letterSpacing: "-1.5px",
                    color: "#fff",
                    marginBottom: 10,
                  }}
                >
                Image Enhancer
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    color: "var(--color-text-2)",
                    maxWidth: 560,
                    lineHeight: 1.7,
                  }}
                >
                  Restore clarity, sharpen details, and upscale any image
                  instantly, no signup, no limits, 100% free.
                </p>
              </div>
            </div>

            <ImageEnhancer />

            {/* SEO Content */}
            <div
              style={{
                maxWidth: 760,
                margin: "60px auto 0",
                borderTop: "1px solid var(--color-border)",
                paddingTop: 48,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 26,
                  letterSpacing: "-0.8px",
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                About Convoox Image Enhancer
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-text-2)",
                  lineHeight: 1.8,
                  marginBottom: 16,
                }}
              >
                Convoox Image Enhancer uses advanced AI to bring new life to
                your photos. Whether it's a blurry old photo, a low-quality
                screenshot, or a pixelated image simply upload and get a
                sharper, clearer, high-quality result in seconds. Use the
                before/after slider to see the difference instantly. No account
                needed, completely free.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
