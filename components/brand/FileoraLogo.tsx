import Link from "next/link";
import type { CSSProperties } from "react";
import { FileoraBadge } from "./FileoraBadge";

type FileoraLogoProps = {
  href?: string;
  markSize?: number;
  badgeSize?: number;
  badgeRadius?: number;
  wordSize?: number;
  className?: string;
  style?: CSSProperties;
};

export function FileoraLogo({
  href = "/",
  markSize,
  badgeSize = 32,
  badgeRadius = 9,
  wordSize = 17,
  style,
}: FileoraLogoProps) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        ...style,
      }}
    >
      <FileoraBadge size={badgeSize} markSize={markSize} radius={badgeRadius} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: wordSize,
          color: "#fff",
          letterSpacing: "-0.5px",
        }}
      >
        File<span style={{ color: "var(--color-brand)" }}>ora</span>
      </span>
    </Link>
  );
}
