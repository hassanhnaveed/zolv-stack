import Link from "next/link";
import type { CSSProperties } from "react";

type ZolvStackLogoProps = {
  href?: string;
  wordSize?: number;
  className?: string;
  style?: CSSProperties;
};

export function ZolvStackLogo({
  href = "/",
  wordSize = 20,
  style,
}: ZolvStackLogoProps) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: wordSize,
        letterSpacing: "-0.5px",
        color: "#fff",
        textDecoration: "none",
        ...style,
      }}
    >
      Zolv<span style={{ color: "var(--color-brand)" }}>Stack</span>
    </Link>
  );
}
