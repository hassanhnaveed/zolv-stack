"use client";

import { Layers, Rocket, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/marketing/zolvstack/ProductCard";
import {
  ContentPageHero,
  CalloutBanner,
  CompanyPageSection,
} from "@/components/marketing/company/ContentPageHero";
import { FeatureCardGrid } from "@/components/marketing/company/FeatureCardGrid";
import { ZOLVSTACK_PRODUCTS } from "@/lib/zolvstack-catalog";

export function ProductsPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero
        title="Our"
        titleAccent="Products"
      />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 8 }}>
        <CalloutBanner icon={Layers}>
          ZolvStack builds focused, free web tools under a single parent brand.
          Each product solves a real everyday problem — starting with Fileora for
          file conversion, with more on the way.
        </CalloutBanner>
      </CompanyPageSection>

      <CompanyPageSection style={{ paddingTop: 8, paddingBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {ZOLVSTACK_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          <div
            className="card"
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: 280,
              borderStyle: "dashed",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--color-text-3)",
                marginBottom: 10,
              }}
            >
              More coming
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#fff",
                marginBottom: 10,
              }}
            >
              Future ZolvStack products
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-2)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              We are building additional tools across productivity, media, and
              automation. New products will appear here as they launch.
            </p>
          </div>
        </div>
      </CompanyPageSection>

      <FeatureCardGrid
        heading="How we choose what to build"
        items={[
          {
            icon: Rocket,
            title: "Solve real problems",
            body: "Every ZolvStack product starts with a clear user need — not a feature checklist. We ship tools people reach for daily.",
          },
          {
            icon: Sparkles,
            title: "Free and accessible",
            body: "Our products stay free to use, work in the browser, and avoid unnecessary signups or paywalls wherever possible.",
          },
          {
            icon: Layers,
            title: "Built to scale",
            body: "The ZolvStack portfolio is designed to grow. New products plug into the same brand, quality bar, and privacy standards.",
          },
        ]}
        variant="alt"
      />
    </div>
  );
}
