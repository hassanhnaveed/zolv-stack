"use client";

import Link from "next/link";
import { DualBrandLockup } from "@/components/brand/DualBrandLockup";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border)", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <DualBrandLockup variant="footer" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "var(--color-text-3)", lineHeight: 1.7, maxWidth: 220 }}>
              Free, fast, and private file conversion. No limits. No watermarks. No signup.
            </p>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Company</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/about" style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>About Us</Link>
              <Link href="/security" style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>Security</Link>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Legal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>Terms of Service</Link>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-3)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 14 }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/contact" style={{ fontSize: 13, color: "var(--color-text-2)", textDecoration: "none" }}>Contact Us</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            © {new Date().getFullYear()} Fileora. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            Built with Next.js 16 · Powered by Sharp
          </p>
        </div>
      </div>
    </footer>
  );
}
