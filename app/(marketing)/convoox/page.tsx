

"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TOOL_CONFIG, type ToolSlug } from "@/lib/utils";
import { useCallback, useState } from "react";
import { SmartUploadWidget } from "@/components/tools/SmartUploadWidget";
import { HeroConversionGraphic } from "@/components/marketing/HeroConversionGraphic";
import {
  DEFAULT_HERO_COPY,
  HERO_ROTATING_PAIRS,
  resolveToolFromFormats,
  type HeroCopy,
} from "@/lib/format-catalog";

const tools = Object.values(TOOL_CONFIG);

// Naye document-conversion tools ki list — ye office format se PDF banate hain
const documentToolSlugs: ToolSlug[] = [
  "docx-to-pdf",
  "doc-to-pdf",
  "odt-to-pdf",
  "rtf-to-pdf",
  "txt-to-pdf",
  "html-to-pdf",
  "md-to-pdf",
];

const aiToolSlugs: ToolSlug[] = ["image-enhance", "remove-bg"];

const imageTools = tools.filter(
  (t) =>
    !t.slug.startsWith("pdf") &&
    !documentToolSlugs.includes(t.slug) &&
    !aiToolSlugs.includes(t.slug),
);
const pdfTools = tools.filter((t) => t.slug.startsWith("pdf"));
const documentTools = tools.filter((t) => documentToolSlugs.includes(t.slug));
const aiTools = tools.filter((t) => aiToolSlugs.includes(t.slug));

const categories = [
  { id: "image", label: "🖼️ Image Tools", tools: imageTools, color: "#00D084" },
  { id: "pdf", label: "📄 PDF Tools", tools: pdfTools, color: "#6366F1" },
  { id: "document", label: "📝 Document Tools", tools: documentTools, color: "#F59E0B" },
  { id: "ai", label: "✨ AI Tools", tools: aiTools, color: "#8B5CF6" },
];

const whyItems = [
  {
    icon: Zap,
    title: "Lightning fast",
    desc: "Sharp-powered server processing. Most files convert in under a second.",
  },
  {
    icon: Lock,
    title: "100% private",
    desc: "Files processed in memory and immediately discarded. Never stored on our servers.",
  },
  {
    icon: Globe,
    title: "No limits",
    desc: "Convert unlimited files. No daily caps, no registration required, no watermarks.",
  },
  {
    icon: ShieldCheck,
    title: "Always free",
    desc: "All current tools are free forever. No credit card, no hidden fees.",
  },
];

const faqs = [
  {
    q: "Is Convoox really free to use?",
    a: "Yes — all tools on Convoox are completely free. No hidden fees, no credit card, no account required. Convert unlimited files.",
  },
  {
    q: "Are my files stored on your servers?",
    a: "No. Files are processed in memory and deleted immediately after conversion. We never store, share, or access your files.",
  },
  {
    q: "What is WebP and why should I use it?",
    a: "WebP is a modern image format by Google that provides 25-80% smaller files vs JPG/PNG at equivalent quality — making websites load faster and improving SEO.",
  },
  {
    q: "Do all browsers support WebP?",
    a: "Yes. Chrome, Firefox, Safari 14+, Edge, and Opera all support WebP. It has 97%+ global browser support as of 2024.",
  },
  {
    q: "What is the maximum file size?",
    a: "50MB per file. You can convert up to 20 files at once and download them all as a ZIP archive.",
  },
  {
    q: "What image formats can I convert?",
    a: "Convoox supports JPG, JPEG, PNG, GIF, BMP, TIFF, AVIF, HEIC, HEIF, and WebP as input formats depending on the tool.",
  },
  {
    q: "Can I convert multiple files at once?",
    a: "Yes! Upload up to 20 files, convert them all with one click, and download as a single ZIP file.",
  },
  {
    q: "How do I compress a PDF?",
    a: "Go to our PDF Compress tool, upload your PDF, click Convert, and download the compressed version. No quality loss on text and vector content.",
  },
];

export default function HomePage() {
  const [openCategory, setOpenCategory] = useState<string>("image");
  const [heroCopy, setHeroCopy] = useState<HeroCopy>(DEFAULT_HERO_COPY);
  const [preferredTool, setPreferredTool] = useState<ToolSlug | null>(
    resolveToolFromFormats(
      HERO_ROTATING_PAIRS[0].source,
      HERO_ROTATING_PAIRS[0].target,
    ),
  );

  const handleHeroCopyChange = useCallback((copy: HeroCopy) => {
    setHeroCopy(copy);
  }, []);

  const handleHeroToolChange = useCallback((tool: ToolSlug | null) => {
    setPreferredTool(tool);
  }, []);

  return (
    <>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(0,208,132,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            right: -100,
            width: 400,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(0,184,224,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)",
              gap: 48,
              alignItems: "center",
              marginBottom: 48,
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div className="badge" style={{ marginBottom: 24 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--color-brand)",
                    display: "inline-block",
                  }}
                />
                Free · Unlimited · No watermarks · No signup
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${heroCopy.title}-${heroCopy.description}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(32px, 5.2vw, 58px)",
                      fontWeight: 800,
                      lineHeight: 1.08,
                      letterSpacing: "-2px",
                      color: "#fff",
                      marginBottom: 20,
                    }}
                  >
                    {heroCopy.title}
                    <br />
                    <span className="text-gradient">{heroCopy.highlight}</span>
                  </h1>

                  <p
                    style={{
                      fontSize: "clamp(15px, 2vw, 17px)",
                      color: "var(--color-text-2)",
                      lineHeight: 1.7,
                      maxWidth: 540,
                      marginBottom: 0,
                      fontWeight: 300,
                    }}
                  >
                    {heroCopy.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <HeroConversionGraphic
                onCopyChange={handleHeroCopyChange}
                onToolChange={handleHeroToolChange}
              />
            </div>
          </div>

          <div id="upload-widget">
            <SmartUploadWidget preferredTool={preferredTool ?? undefined} />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 20,
              marginTop: 28,
            }}
          >
            {[
              "No signup required",
              "No watermarks",
              "Files never stored",
              "Unlimited conversions",
            ].map((t) => (
              <span
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--color-text-3)",
                }}
              >
                <span style={{ color: "var(--color-brand)", fontSize: 16 }}>
                  ✓
                </span>{" "}
                {t}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link
              href="#tools"
              style={{
                fontSize: 13,
                color: "var(--color-text-3)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: 2,
                transition: "color 0.15s",
              }}
            >
              Browse all tools ↓
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            { val: "80%", label: "Avg. size saved" },
            { val: "15+", label: "Free tools" },
            { val: "50MB", label: "Max file size" },
            { val: "20x", label: "Bulk at once" },
            { val: "0$", label: "Cost forever" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  color: "var(--color-brand)",
                }}
              >
                {val}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-3)",
                  marginTop: 2,
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools — Category Accordion */}
      <section id="tools" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              All conversion tools
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--color-text-2)",
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              Everything you need in one place. Click any tool to start
              converting instantly.
            </p>
          </div>

          {/* Category tabs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setOpenCategory(openCategory === cat.id ? "" : cat.id)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border:
                    openCategory === cat.id
                      ? `1px solid ${cat.color}`
                      : "1px solid var(--color-border)",
                  background:
                    openCategory === cat.id
                      ? `${cat.color}12`
                      : "var(--color-bg-2)",
                  color:
                    openCategory === cat.id ? cat.color : "var(--color-text-2)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  transition: "all 0.2s ease",
                }}
              >
                {cat.label}
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  {cat.tools.length} tools
                </span>
                <span
                  style={{
                    fontSize: 12,
                    transition: "transform 0.2s",
                    transform:
                      openCategory === cat.id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>
            ))}
          </div>

          {/* Tools grid */}
          {categories.map(
            (cat) =>
              openCategory === cat.id && (
                <div
                  key={cat.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 14,
                    marginBottom: 8,
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/${tool.slug}`}
                      className="tool-card"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            flexShrink: 0,
                            background: `${tool.color}15`,
                            border: `1px solid ${tool.color}25`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          {tool.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 700,
                              fontSize: 15,
                              color: "var(--color-text-1)",
                              marginBottom: 4,
                            }}
                          >
                            {tool.title}
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-3)",
                              lineHeight: 1.5,
                            }}
                          >
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ),
          )}
        </div>
      </section>

      {/* Why Convoox */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--color-bg-2)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Why Convoox?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--color-text-2)",
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              No paywalls. No limits. Just fast, private file conversion.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {whyItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: "24px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(0,208,132,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={18} color="var(--color-brand)" />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--color-text-1)",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-3)",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Convert in 3 steps
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                num: "01",
                title: "Choose a tool",
                desc: "Pick the conversion you need from our free tools.",
              },
              {
                num: "02",
                title: "Upload your files",
                desc: "Drag & drop or click to select up to 20 files at once, up to 50MB each.",
              },
              {
                num: "03",
                title: "Download results",
                desc: "Files convert in seconds. Download individually or as a ZIP archive.",
              },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 52,
                    fontWeight: 800,
                    letterSpacing: "-2px",
                    color: "rgba(0,208,132,0.2)",
                    marginBottom: 8,
                  }}
                >
                  {num}
                </p>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "var(--color-text-1)",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-3)",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        style={{
          padding: "80px 24px",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Frequently asked questions
            </h2>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map(({ q, a }) => ({
                  "@type": "Question",
                  name: q,
                  acceptedAnswer: { "@type": "Answer", text: a },
                })),
              }),
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map(({ q, a }) => (
              <div key={q} className="card" style={{ padding: "20px 24px" }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "var(--color-text-1)",
                    marginBottom: 8,
                  }}
                >
                  {q}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-3)",
                    lineHeight: 1.7,
                  }}
                >
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}
