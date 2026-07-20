"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { TOOL_CONFIG, TOOL_CATEGORIES, toolHref, type ToolSlug } from "@/lib/utils";

const categoryMeta: Record<string, { label: string; color: string }> = {
  image: { label: "🖼️ Image Tools", color: "#00D084" },
  pdf: { label: "📄 PDF Tools", color: "#6366F1" },
  document: { label: "📝 Document Tools", color: "#F59E0B" },
  ai: { label: "✨ AI Tools", color: "#8B5CF6" },
};

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/fileora");
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--color-text-3)",
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        marginBottom: 32,
      }}
    >
      <ArrowLeft size={14} /> Back
    </button>
  );
}

export function OtherTools({ activeTool }: { activeTool: ToolSlug }) {
  const [openCategory, setOpenCategory] = useState<string>("image");
//  old code
//   const categories = Object.entries(TOOL_CATEGORIES).map(([id, slugs]) => ({
//     id,
//     label: categoryMeta[id]?.label ?? id,
//     color: categoryMeta[id]?.color ?? "#666",
//     tools: slugs
//       .map((s) => TOOL_CONFIG[s])
//       .filter((t) => t.slug !== activeTool),
//   }));

//new codee
const categories = Object.entries(TOOL_CATEGORIES)
  .filter(([id]) => id === "image")
  .map(([id, slugs]) => ({
    id,
    label: categoryMeta[id]?.label ?? id,
    color: categoryMeta[id]?.color ?? "#666",
    tools: slugs.map((s) => TOOL_CONFIG[s]).filter((t) => t.slug !== activeTool),
  }));

  return (
    <section style={{ padding: "0 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--color-text-2)",
            marginBottom: 16,
            letterSpacing: "-0.5px",
          }}
        >
          Other tools
        </h3>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setOpenCategory(openCategory === cat.id ? "" : cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                border:
                  openCategory === cat.id
                    ? `1px solid ${cat.color}`
                    : "1px solid var(--color-border)",
                background:
                  openCategory === cat.id ? `${cat.color}12` : "var(--color-bg-2)",
                color: openCategory === cat.id ? cat.color : "var(--color-text-2)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.2s ease",
              }}
            >
              {cat.label}
              <span style={{ fontSize: 11, opacity: 0.7 }}>{cat.tools.length} tools</span>
            </button>
          ))}
        </div>

        {categories.map(
          (cat) =>
            openCategory === cat.id && (
              <div
                key={cat.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {cat.tools.map((t) => {
  const isComingSoon = t.slug === "image-enhance" || t.slug === "remove-bg";
  return (
    <Link
      key={t.slug}
      href={isComingSoon ? "#" : toolHref(t.slug)}
      onClick={(e) => isComingSoon && e.preventDefault()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "var(--color-bg-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        textDecoration: "none",
        transition: "border-color 0.2s",
        position: "relative",
        opacity: isComingSoon ? 0.5 : 1,
        cursor: isComingSoon ? "not-allowed" : "pointer",
      }}
    >
      {isComingSoon && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            fontSize: 9,
            fontWeight: 700,
            background: "rgba(245,158,11,0.15)",
            color: "#F59E0B",
            padding: "2px 6px",
            borderRadius: 99,
          }}
        >
          Coming Soon
        </span>
      )}
      <span style={{ fontSize: 18 }}>{t.icon}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>
          {t.title}
        </p>
        <p style={{ fontSize: 11, color: "var(--color-text-3)" }}>
          {t.description}
        </p>
      </div>
    </Link>
  );
})}
              </div>
            ),
        )}
      </div>
    </section>
  );
}