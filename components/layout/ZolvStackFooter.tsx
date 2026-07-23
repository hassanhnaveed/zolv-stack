"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ZolvStackLogo } from "@/components/brand/ZolvStackLogo";
import {
  ZOLVSTACK_COMPANY,
  ZOLVSTACK_FOOTER_SECTIONS,
  type FooterLink,
} from "@/lib/zolvstack-catalog";

const linkStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--color-text-2)",
  textDecoration: "none",
  transition: "color 0.2s",
};

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      style={linkStyle}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = "var(--color-text-1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "var(--color-text-2)")
      }
    >
      {link.label}
    </Link>
  );
}

export function ZolvStackFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border)", marginTop: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <ZolvStackLogo
              wordSize={17}
              style={{ display: "inline-block", marginBottom: 12 }}
            />
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-3)",
                lineHeight: 1.7,
                maxWidth: 260,
              }}
            >
              {ZOLVSTACK_COMPANY.description}
            </p>
          </div>

          {ZOLVSTACK_FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-3)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                {section.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.links.map((link) => (
                  <FooterLinkItem key={link.href} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            © {new Date().getFullYear()} ZolvStack. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-3)" }}>
            Built with Next.js 16 · Privacy-first by design
          </p>
        </div>
      </div>
    </footer>
  );
}
