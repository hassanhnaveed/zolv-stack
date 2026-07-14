import type { CSSProperties } from "react";
import { FileoraMark } from "./FileoraMark";

type FileoraBadgeProps = {
  /** Outer tile size in px */
  size?: number;
  /** Icon size inside the tile (defaults to ~62% of tile) */
  markSize?: number;
  radius?: number;
  style?: CSSProperties;
  className?: string;
};

/** Brand tile: mint background + Convert Arrow mark (shared across UI surfaces). */
export function FileoraBadge({
  size = 32,
  markSize,
  radius = 9,
  style,
  className,
}: FileoraBadgeProps) {
  const iconSize = markSize ?? Math.round(size * 0.62);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "var(--color-brand, #00D084)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <FileoraMark size={iconSize} />
    </div>
  );
}
