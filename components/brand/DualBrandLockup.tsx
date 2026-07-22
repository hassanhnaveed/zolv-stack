import Link from "next/link";
import type { CSSProperties } from "react";
import { FileoraLogo } from "./FileoraLogo";
import { ZolvStackLogo } from "./ZolvStackLogo";

type DualBrandLockupProps = {
  /** Smaller, quieter parent brand for product chrome. */
  variant?: "header" | "footer";
  style?: CSSProperties;
};

export function DualBrandLockup({
  variant = "header",
  style,
}: DualBrandLockupProps) {
  const isHeader = variant === "header";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isHeader ? 10 : 8,
        minWidth: 0,
        ...style,
      }}
    >
      <ZolvStackLogo
        wordSize={isHeader ? 14 : 13}
        style={{
          color: "var(--color-text-2)",
          flexShrink: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          color: "var(--color-text-3)",
          fontSize: isHeader ? 14 : 13,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        /
      </span>
      <FileoraLogo
        badgeSize={isHeader ? 28 : 24}
        badgeRadius={isHeader ? 8 : 7}
        markSize={isHeader ? 16 : 14}
        wordSize={isHeader ? 15 : 14}
        style={{ minWidth: 0 }}
      />
    </div>
  );
}

/** Compact parent-brand links shown in the Fileora mobile menu. */
export function ZolvStackEcosystemLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const links = [
    { label: "ZolvStack Home", href: "/" },
    { label: "All Products", href: "/products" },
    { label: "About ZolvStack", href: "/about" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingBottom: 12,
        marginBottom: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--color-text-3)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        ZolvStack
      </p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          style={{
            fontSize: 14,
            color: "var(--color-text-2)",
            padding: "6px 0",
            textDecoration: "none",
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
