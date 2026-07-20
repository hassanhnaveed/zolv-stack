"use client";

import Link from "next/link";
import { ProductCard } from "@/components/marketing/zolvstack/ProductCard";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { ZOLVSTACK_PRODUCTS } from "@/lib/zolvstack-catalog";

export function ZolvStackHomeClient() {
  return (
    <ZolvStackPageShell mainPaddingTop={0}>
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 100,
          textAlign: "center",
          padding: "160px 24px 100px",
          position: "relative",
        }}
      >
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
            fontFamily: "var(--font-display)",
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
          <span className="text-gradient">get things done.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--color-text-2)",
            maxWidth: 460,
            margin: "0 auto 48px",
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          A growing collection of free, fast, and private web tools — no
          subscriptions, no watermarks, no nonsense.
        </p>

        <Link
          href="/products"
          className="btn-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Explore Products
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </section>

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 48,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "var(--color-text-3)",
                textTransform: "uppercase" as const,
                marginBottom: 10,
              }}
            >
              What we build
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 800,
                letterSpacing: "-1.5px",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              ZolvStack products
            </h2>
          </div>
          <Link
            href="/products"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-brand)",
              textDecoration: "none",
            }}
          >
            View all products →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          {ZOLVSTACK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </ZolvStackPageShell>
  );
}
