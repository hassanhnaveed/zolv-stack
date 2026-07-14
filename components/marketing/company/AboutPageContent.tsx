
"use client";

import { Zap, Target, Layers, Sparkles, BadgeCheck } from "lucide-react";
import { ContentPageHero, CalloutBanner, CompanyPageSection } from "./ContentPageHero";
import { FeatureCardGrid } from "./FeatureCardGrid";

export function AboutPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="About Us" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Layers}>
          Convoox is a free online file conversion platform built for people who need fast, reliable tools without the hassle of signups, watermarks, or limits. Our mission is simple: make file conversion effortless. Whether you are converting images to WebP, merging PDFs, or enhancing photos, Convoox gives you professional results in seconds — right in your browser.
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        items={[
          {
            icon: Layers,
            title: "What We Do",
            body: "Convoox offers a growing suite of free file conversion tools — image format conversion, PDF merge and compress, background removal, and more. Every tool is designed to be intuitive: upload your files, click convert, and download the result. No learning curve, no unnecessary steps.",
          },
          {
            icon: Target,
            title: "Why We Built Convoox",
            body: "Most online converters are cluttered with ads, hidden paywalls, and confusing interfaces. We built Convoox to be the opposite — a clean, fast, and trustworthy platform where anyone can convert files without creating an account or worrying about their data.",
          },
          {
            icon: Zap,
            title: "Fast & Reliable",
            body: "Speed matters. Our tools are powered by high-performance server-side processing, so most conversions complete in under a second. We support bulk uploads of up to 20 files at a time, with no daily limits and no file watermarks on your output.",
          },
          {
            icon: Sparkles,
            title: "Easy to Use",
            body: "We believe great tools should be accessible to everyone. Convoox works on any modern browser, requires no software installation, and keeps the interface minimal so you can focus on getting your work done.",
          },
        ]}
        variant="alt"
      />

      <CompanyPageSection style={{ paddingTop: 8 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 2.5vw, 24px)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
            textAlign: "left",
            marginBottom: 14,
          }}
        >
          Our Commitment
        </h2>
        <CalloutBanner icon={BadgeCheck} delay={0}>
          We are committed to keeping Convoox free, private, and continuously improving. Your files are processed securely and never stored on our servers. We listen to what our users need and regularly add new tools and formats to make Convoox the go-to destination for everyday file conversion.
        </CalloutBanner>
      </CompanyPageSection>
    </div>
  );
}
