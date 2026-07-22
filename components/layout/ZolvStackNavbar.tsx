"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ZolvStackLogo } from "@/components/brand/ZolvStackLogo";
import { ZOLVSTACK_NAV_LINKS } from "@/lib/zolvstack-catalog";

const navLinkStyle: CSSProperties = {
  fontSize: 14,
  color: "var(--color-text-2)",
  textDecoration: "none",
  transition: "color 0.2s",
};

export function ZolvStackNavbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(17,19,24,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <ZolvStackLogo wordSize={20} />

          <nav
            style={{ alignItems: "center", gap: 32 }}
            className="hidden md:flex"
          >
            {ZOLVSTACK_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={navLinkStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-2)")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
