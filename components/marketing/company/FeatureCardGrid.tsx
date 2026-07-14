"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { COMPANY_PAGE_MAX_WIDTH } from "./ContentPageHero";

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  body: string;
};

type FeatureCardGridProps = {
  heading?: string;
  subheading?: string;
  items: FeatureItem[];
  variant?: "default" | "alt";
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

function getGridClass(itemCount: number) {
  return itemCount === 4 ? "company-card-grid--quad" : "company-card-grid--six";
}

export function FeatureCardGrid({
  heading,
  subheading,
  items,
  variant = "default",
}: FeatureCardGridProps) {
  return (
    <section
      style={{
        padding: variant === "alt" ? "20px 24px 32px" : "16px 24px 32px",
        background: "transparent",
        // borderTop: variant === "alt" ? "1px solid var(--color-border)" : undefined,
      }}
    >
      <div style={{ maxWidth: COMPANY_PAGE_MAX_WIDTH, margin: "0 auto" }}>
        {(heading || subheading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ textAlign: "left", marginBottom: 20 }}
          >
            {heading && (
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 2.5vw, 24px)",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#fff",
                  marginBottom: subheading ? 6 : 0,
                }}
              >
                {heading}
              </h2>
            )}
            {subheading && (
              <p style={{ fontSize: 15, color: "var(--color-text-2)", maxWidth: 520, margin: 0 }}>
                {subheading}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className={`company-card-grid ${getGridClass(items.length)}`}
        >
          {items.map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={cardVariants} className="feature-card glow-hover">
              <div
                className="feature-card__icon"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(0,208,132,0.1)",
                  // border: "1px solid rgba(0,208,132,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Icon size={18} color="var(--color-brand)" strokeWidth={2} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--color-text-1)",
                  marginBottom: 8,
                  letterSpacing: "-0.3px",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--color-text-2)", lineHeight: 1.65, margin: 0 }}>
                {body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
