"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { DualBrandLockup } from "@/components/brand/DualBrandLockup";

const linkStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--color-text-2)",
  textDecoration: "none",
};

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border)", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <DualBrandLockup variant="footer" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "var(--color-text-3)", lineHeight: 1.7, maxWidth: 240 }}>
              Free, fast, and private file conversion. A ZolvStack product — no limits,
              no watermarks, no signup.
            </p>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>ZolvStack</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/" style={linkStyle}>ZolvStack Home</Link>
              <Link href="/products" style={linkStyle}>All Products</Link>
              <Link href="/about" style={linkStyle}>About ZolvStack</Link>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Company</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/contact" style={linkStyle}>Contact Us</Link>
              <Link href="/security" style={linkStyle}>Security</Link>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Legal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
              <Link href="/terms" style={linkStyle}>Terms of Service</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            © {new Date().getFullYear()} ZolvStack. Fileora is a ZolvStack product.
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            Built with Next.js 16 · Powered by Sharp
          </p>
        </div>
      </div>
    </footer>
  );
}
