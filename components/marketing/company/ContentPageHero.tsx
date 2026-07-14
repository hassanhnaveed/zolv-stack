"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export const COMPANY_PAGE_MAX_WIDTH = 1100;

type ContentPageHeroProps = {
  title: string;
  titleAccent?: string;
};

export function ContentPageHero({ title, titleAccent }: ContentPageHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "20px 24px 8px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -48,
          left: 0,
          width: 360,
          height: 200,
          background: "radial-gradient(ellipse, rgba(0,208,132,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: COMPANY_PAGE_MAX_WIDTH,
          margin: "0 auto",
          textAlign: "left",
          position: "relative",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-1.2px",
              color: "#fff",
              marginBottom: 0,
            }}
          >
            {title}
            {titleAccent && (
              <>
                {" "}
                <span className="text-gradient">{titleAccent}</span>
              </>
            )}
          </h1>
        </motion.div>
      </div>
    </section>
  );
}

type CalloutBannerProps = {
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
  emphasized?: boolean;
};

export function CalloutBanner({ icon: Icon, children, delay = 0.08, emphasized }: CalloutBannerProps) {
  return (
    <motion.div
      className="callout-banner glow-hover"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
      style={{
        padding: "18px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div
        className="callout-banner__icon"
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(0,208,132,0.1)",
          border: "1px solid rgba(0,208,132,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color="var(--color-brand)" strokeWidth={2} />
      </div>
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text-1)",
          lineHeight: 1.7,
          margin: 0,
          fontWeight: emphasized ? 500 : 400,
        }}
      >
        {children}
      </p>
    </motion.div>
  );
}

export function CompanyPageSection({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ maxWidth: COMPANY_PAGE_MAX_WIDTH, margin: "0 auto", padding: "0 24px", ...style }}>
      {children}
    </div>
  );
}
