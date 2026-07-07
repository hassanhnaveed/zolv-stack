"use client";

import { Converter } from "@/components/tools/Converter";
import { TOOL_CONFIG, type ToolSlug } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { PdfSplitter } from "./pdfSplitter";
import { PdfToWord } from "./pdfToWord";

export function ToolPage({ slug }: { slug: ToolSlug }) {
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<ToolSlug>(slug);
  const config = TOOL_CONFIG[activeTool];
  const otherTools = Object.values(TOOL_CONFIG).filter(
    (t) => t.slug !== activeTool,
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://fileora.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: config.title,
        item: `https://fileora.com/${slug}`,
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `fileora ${config.title}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: config.longDesc,
    url: `https://fileora.com/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Hero */}
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
            background: `radial-gradient(ellipse, ${config.color}10 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/fileora");
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--color-text-3)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: 32,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>

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
                background: `${config.color}15`,
                border: `1px solid ${config.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {config.icon}
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
                {config.title}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--color-text-2)",
                  maxWidth: 560,
                  lineHeight: 1.7,
                }}
              >
                {config.longDesc}
              </p>
            </div>
          </div>

          
          {slug === "pdf-split" ? (
            <PdfSplitter />
          ) : slug === "pdf-to-word" ? (
            <PdfToWord />
          ) : (
            <Converter
              tool={activeTool}
              onToolChange={(t) => setActiveTool(t)}
            />
          )}
        </div>
      </section>

      {/* SEO content */}
      {/* <section style={{ borderTop: "1px solid var(--color-border)", padding: "60px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, letterSpacing: "-0.8px", color: "#fff", marginBottom: 16 }}>
            About {config.title}
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-2)", lineHeight: 1.8 }}>
            {config.longDesc} fileora makes {config.title.toLowerCase()} completely free — no registration, no watermarks, no file limits. All processing happens securely on our servers using Sharp, the industry-standard image processing library.
          </p>
        </div>
      </section> */}

      {/* Other tools */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--color-text-2)",
              marginBottom: 16,
              letterSpacing: "-0.5px",
            }}
          >
            Other tools
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {otherTools.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: "var(--color-bg-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-1)",
                    }}
                  >
                    {t.title}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                    {t.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
