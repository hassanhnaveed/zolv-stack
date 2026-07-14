"use client";

import Link from "next/link";
import { useState } from "react";
import { FileoraBadge } from "@/components/brand/FileoraBadge";

const products = [
  {
    name: "Fileora",
    tagline: "Free File Converter",
    description:
      "Convert any image format, remove backgrounds, enhance photos with AI, merge & compress PDFs. Unlimited, no signup, no watermarks.",
    href: "/fileora",
    color: "#00D084",
    tags: ["Image Converter", "PDF Tools", "AI Enhancer", "Background Remover"],
  },
];

export default function ZolvStackHome() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0C0C0F",
        color: "#F0F2F5",
        fontFamily: "Satoshi, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(12,12,15,0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.5px",
              fontFamily: "Cabinet Grotesk, sans-serif",
            }}
          >
            Zolv<span style={{ color: "#00D084" }}>Stack</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a
              href="#products"
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
              }
            >
              Products
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 100,
          textAlign: "center",
          padding: "160px 24px 100px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 500,
            background:
              "radial-gradient(ellipse at center top, rgba(0,208,132,0.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-block",
            background: "rgba(0,208,132,0.07)",
            border: "1px solid rgba(0,208,132,0.18)",
            color: "#00D084",
            fontSize: 11,
            fontWeight: 700,
            padding: "5px 16px",
            borderRadius: 100,
            letterSpacing: "1.5px",
            marginBottom: 32,
            textTransform: "uppercase" as const,
          }}
        >
          Free · No Signup · No Limits
        </div>

        <h1
          style={{
            fontFamily: "Cabinet Grotesk, sans-serif",
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: 800,
            letterSpacing: "-3px",
            lineHeight: 1.03,
            marginBottom: 24,
            color: "#fff",
          }}
        >
          Tools that actually
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00D084 0%, #00B8E0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            get things done.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "rgba(255,255,255,0.38)",
            maxWidth: 460,
            margin: "0 auto 48px",
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          A growing collection of free, fast, and private web tools — no
          subscriptions, no watermarks, no nonsense.
        </p>

        <a
          href="#products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#00D084",
            color: "#0A0F0D",
            fontWeight: 700,
            fontSize: 15,
            padding: "13px 28px",
            borderRadius: 12,
            textDecoration: "none",
            transition: "all 0.2s ease",
            fontFamily: "Cabinet Grotesk, sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform =
              "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 12px 32px rgba(0,208,132,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Explore Tools
          <span style={{ fontSize: 18 }}>↓</span>
        </a>
      </section>

      {/* Products */}
      <section
        id="products"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 120px" }}
      >
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase" as const,
              marginBottom: 10,
            }}
          >
            What we build
          </p>
          <h2
            style={{
              fontFamily: "Cabinet Grotesk, sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            Our products
          </h2>
        </div>
        {/* fileora box */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          {products.map((product) => (
            <Link
              key={product.name}
              href={product.href}
              target="_blank"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  background: "#13141A",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: 28,
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${product.color}40`;
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 20px 60px ${product.color}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <FileoraBadge size={52} markSize={32} radius={14} />
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.05)",
                      padding: "4px 10px",
                      borderRadius: 100,
                    }}
                  >
                    Free
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "Cabinet Grotesk, sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {product.name}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  {product.tagline}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.65,
                    marginBottom: 20,
                  }}
                >
                  {product.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: product.color,
                        background: `${product.color}12`,
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: `1px solid ${product.color}20`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: product.color,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Try {product.name} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "Cabinet Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            Zolv<span style={{ color: "#00D084" }}>Stack</span>
          </span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
            © {new Date().getFullYear()} ZolvStack. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

