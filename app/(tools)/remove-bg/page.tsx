import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundRemover } from "@/components/tools/BackgroundRemover";

export const metadata: Metadata = {
  title: "Background Remover  Free Online | Remove Image Background with AI",
  description:
    "Remove background from any image instantly with AI. Free, unlimited, no signup. Perfect for product photos, portraits, and graphics.",
  keywords:
    "remove background online free, background remover ai, transparent background image, remove bg unlimited",
  alternates: { canonical: "https://fileora.netlify.app/remove-bg" },
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
                "radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)",
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
                  background: "rgba(6,182,212,0.15)",
                  border: "1px solid rgba(6,182,212,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                🪄
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
                  Background Remover
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    color: "var(--color-text-2)",
                    maxWidth: 560,
                    lineHeight: 1.7,
                  }}
                >
                  Remove the background from any image instantly using AI. Free,
                  unlimited, no signup required.
                </p>
              </div>
            </div>

            <BackgroundRemover />

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
                About Background Remover
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-text-2)",
                  lineHeight: 1.8,
                }}
              >
                Fileora Background Remover uses advanced AI to detect and remove
                backgrounds from your images automatically. Perfect for product
                photography, portraits, profile pictures, and graphic design.
                Get a clean transparent PNG in seconds  completely free and
                unlimited.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
