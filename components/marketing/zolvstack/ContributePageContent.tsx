"use client";

import {
  BookOpen,
  Bug,
  Code2,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  TestTube2,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  ContentPageHero,
  CalloutBanner,
  CompanyPageSection,
  COMPANY_PAGE_MAX_WIDTH,
} from "@/components/marketing/company/ContentPageHero";
import { FeatureCardGrid } from "@/components/marketing/company/FeatureCardGrid";
import { ZOLVSTACK_COMPANY } from "@/lib/zolvstack-catalog";

const CONTRIBUTION_WAYS = [
  {
    icon: Code2,
    title: "Feature Development",
    body: "Build new capabilities, improve existing tools, and help ship features that make everyday work faster for everyone.",
  },
  {
    icon: Bug,
    title: "Bug Fixes",
    body: "Spot issues, reproduce them, and submit fixes. Small patches and careful debugging keep the project reliable.",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    body: "Clarify setup steps, improve guides, and write examples so newcomers can contribute with confidence.",
  },
  {
    icon: Lightbulb,
    title: "Ideas & Feedback",
    body: "Suggest improvements, share use cases, and help prioritize what to build next — no code required.",
  },
  {
    icon: TestTube2,
    title: "Testing & QA",
    body: "Try new flows, report edge cases, and help verify changes across browsers and devices before they ship.",
  },
  {
    icon: MessageCircle,
    title: "Community Support",
    body: "Welcome contributors, answer questions, and help others get unblocked so the community can grow together.",
  },
] as const;

export function ContributePageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="Contribute" titleAccent="with ZolvStack" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Users} emphasized>
          ZolvStack is open source and community-driven. Developers, designers,
          writers, testers, and anyone with ideas can collaborate — by improving
          the codebase, reporting issues, sharing feedback, or helping others get
          started. There are no job listings here; this page is about building
          together.
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        heading="Ways to contribute"
        subheading="Pick the path that fits your skills and interests. Every contribution helps shape the project."
        items={[...CONTRIBUTION_WAYS]}
        variant="alt"
      />

      <CompanyPageSection style={{ paddingTop: 8, paddingBottom: 16 }}>
        <div
          className="card"
          style={{
            padding: "28px 28px 30px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: COMPANY_PAGE_MAX_WIDTH,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
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
              <HeartHandshake size={18} color="var(--color-brand)" strokeWidth={2} />
            </div>
            <div>
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
                Help shape what comes next
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--color-text-2)",
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: 640,
                }}
              >
                Ready to contribute code, docs, or ideas? Open the repository to
                get started — or reach out if you want to discuss collaboration,
                partnerships, or questions first.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <a
              href={ZOLVSTACK_COMPANY.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              View on GitHub
              <span style={{ fontSize: 18 }}>→</span>
            </a>
            <Link href="/contact" className="btn-ghost">
              Contact Us
            </Link>
          </div>
        </div>
      </CompanyPageSection>
    </div>
  );
}
