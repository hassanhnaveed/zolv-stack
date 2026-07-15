"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOL_CONFIG } from "@/lib/utils";
import { FileoraLogo } from "@/components/brand/FileoraLogo";

const tools = Object.values(TOOL_CONFIG);

export function Navbar() {
  const [open, setOpen] = useState(false);

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
          {/* Logo */}
          <FileoraLogo />

          {/* Desktop nav */}
          <nav
            style={{ alignItems: "center", gap: 32 }}
            className="hidden md:flex"
          >
            <Link
              href="/fileora#tools"
              style={{
                fontSize: 14,
                color: "var(--color-text-2)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text-1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-2)")
              }
            >
              Tools
            </Link>
            <Link
              href="/fileora#how-it-works"
              style={{
                fontSize: 14,
                color: "var(--color-text-2)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text-1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-2)")
              }
            >
              How it works
            </Link>
            <Link
              href="/fileora#faq"
              style={{
                fontSize: 14,
                color: "var(--color-text-2)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text-1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-2)")
              }
            >
              FAQ
            </Link>
          </nav>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="md:hidden"
              onClick={() => setOpen(!open)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: "var(--color-text-1)",
              }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(17,19,24,0.98)",
              overflow: "hidden",
            }}
          >
            {/* <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
              {tools.map(t => (
                <Link key={t.slug} href={`/${t.slug}`} onClick={() => setOpen(false)}
                  style={{ fontSize: 14, color: "var(--color-text-2)", padding: "10px 0", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span>{t.icon}</span>
                  {t.title}
                </Link>
              ))}
            </div> */}
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-3)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Image Tools
              </p>
              {tools
                .filter((t) => !t.slug.startsWith("pdf"))
                .map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    onClick={() => setOpen(false)}
                    style={{
                      fontSize: 14,
                      color: "var(--color-text-2)",
                      padding: "8px 0",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span>{t.icon}</span>
                    {t.title}
                  </Link>
                ))}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-3)",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  margin: "12px 0 8px",
                }}
              >
                PDF Tools
              </p>
              {tools
                .filter((t) => t.slug.startsWith("pdf"))
                .map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    onClick={() => setOpen(false)}
                    style={{
                      fontSize: 14,
                      color: "var(--color-text-2)",
                      padding: "8px 0",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span>{t.icon}</span>
                    {t.title}
                  </Link>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
