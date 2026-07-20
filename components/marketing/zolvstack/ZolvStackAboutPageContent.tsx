"use client";

import { Eye, Layers, Rocket, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import {
  ContentPageHero,
  CalloutBanner,
  CompanyPageSection,
} from "@/components/marketing/company/ContentPageHero";
import { FeatureCardGrid } from "@/components/marketing/company/FeatureCardGrid";
import { ProductCard } from "@/components/marketing/zolvstack/ProductCard";
import {
  ZOLVSTACK_COMPANY,
  ZOLVSTACK_PRODUCTS,
} from "@/lib/zolvstack-catalog";

export function ZolvStackAboutPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="About" titleAccent="ZolvStack" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Layers}>
          {ZOLVSTACK_COMPANY.mission} {ZOLVSTACK_COMPANY.vision}
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        items={[
          {
            icon: Target,
            title: "Our Mission",
            body: "Make powerful, everyday tools available to everyone — fast, private, and free. We believe software should get out of your way and help you finish the task at hand.",
          },
          {
            icon: Eye,
            title: "Our Vision",
            body: "Build a trusted portfolio of focused products under the ZolvStack brand — each excellent at one job, all sharing the same commitment to quality and privacy.",
          },
          {
            icon: Rocket,
            title: "What We Build",
            body: "ZolvStack creates browser-based tools for file conversion, media processing, and productivity. Our first product, Fileora, handles images, PDFs, and documents with no signup required.",
          },
          {
            icon: Sparkles,
            title: "How We Work",
            body: "We ship incrementally, listen to user feedback, and keep interfaces clean. Privacy is a default — not an upsell. Your files are processed securely and not stored on our servers.",
          },
        ]}
        variant="alt"
      />

      <CompanyPageSection style={{ paddingTop: 8, paddingBottom: 8 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 2.5vw, 24px)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
            marginBottom: 8,
          }}
        >
          Our products
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--color-text-2)",
            lineHeight: 1.7,
            marginBottom: 20,
            maxWidth: 640,
          }}
        >
          Fileora is the first product in the ZolvStack ecosystem — a free online
          file converter for images, PDFs, and documents. More products are in
          development.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {ZOLVSTACK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          href="/products"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-brand)",
            textDecoration: "none",
          }}
        >
          View all products →
        </Link>
      </CompanyPageSection>
    </div>
  );
}
