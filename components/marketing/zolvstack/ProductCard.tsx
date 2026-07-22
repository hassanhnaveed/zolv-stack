"use client";

import Link from "next/link";
import { FileoraBadge } from "@/components/brand/FileoraBadge";
import type { ZolvStackProduct } from "@/lib/zolvstack-catalog";

type ProductCardProps = {
  product: ZolvStackProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const isLive = product.status === "live";

  const card = (
    <div
      style={{
        background: "var(--color-bg-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 20,
        padding: 28,
        transition: "all 0.25s ease",
        cursor: isLive ? "pointer" : "default",
        height: "100%",
        opacity: isLive ? 1 : 0.72,
      }}
      onMouseEnter={(e) => {
        if (!isLive) return;
        e.currentTarget.style.borderColor = `${product.color}40`;
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 20px 60px ${product.color}15`;
      }}
      onMouseLeave={(e) => {
        if (!isLive) return;
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {product.id === "fileora" ? (
          <FileoraBadge size={52} markSize={32} radius={14} />
        ) : (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${product.color}15`,
              border: `1px solid ${product.color}30`,
            }}
          />
        )}
        <span
          style={{
            fontSize: 12,
            color: isLive ? "var(--color-text-3)" : "#F59E0B",
            background: isLive ? "rgba(255,255,255,0.05)" : "rgba(245,158,11,0.12)",
            padding: "4px 10px",
            borderRadius: 100,
            fontWeight: 600,
          }}
        >
          {isLive ? "Live" : "Coming Soon"}
        </span>
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--color-text-3)",
          marginBottom: 8,
        }}
      >
        ZolvStack Product
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "#fff",
          marginBottom: 8,
        }}
      >
        {product.name}
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-2)",
          fontWeight: 500,
          marginBottom: 14,
        }}
      >
        {product.tagline}
      </p>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-text-2)",
          lineHeight: 1.65,
          marginBottom: 20,
        }}
      >
        {product.description}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: isLive ? 20 : 0,
        }}
      >
        {product.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: product.color,
              background: `${product.color}12`,
              padding: "3px 10px",
              borderRadius: 100,
              border: `1px solid ${product.color}20`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {isLive && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: product.color,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Open {product.name} →
        </div>
      )}
    </div>
  );

  if (!isLive) {
    return card;
  }

  return (
    <Link href={product.href} style={{ textDecoration: "none", display: "block" }}>
      {card}
    </Link>
  );
}
