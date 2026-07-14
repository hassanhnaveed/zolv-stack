"use client";

import {
  Scale,
  FileCheck,
  Ban,
  ShieldAlert,
  AlertTriangle,
  Copyright,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import { ContentPageHero, CalloutBanner, CompanyPageSection } from "./ContentPageHero";
import { FeatureCardGrid } from "./FeatureCardGrid";

export function TermsPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="Terms of Service" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Scale} emphasized>
          These terms set the ground rules for using Convoox. By accessing our free conversion tools, you agree to use the service lawfully, respect others&apos; rights, and accept that Convoox is provided as-is without guaranteed uptime or conversion accuracy for every file type.
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        items={[
          {
            icon: FileCheck,
            title: "Use of Service",
            body: "Convoox is provided for lawful personal and commercial use. You may convert files you own or have the legal right to process. You may not use this service to convert copyrighted material you do not own or lack permission to use.",
          },
          {
            icon: Ban,
            title: "Acceptable Use",
            body: "Do not upload malicious files, illegal content, or material intended to harm others. Do not attempt to abuse, overload, scrape, or disrupt our servers. We reserve the right to block access for abusive or harmful use.",
          },
          {
            icon: ShieldAlert,
            title: "No Warranty",
            body: "Convoox is provided \"as is\" without warranty of any kind, express or implied. We do not guarantee 100% uptime, uninterrupted access, or conversion accuracy for all file types, sizes, or edge cases.",
          },
          {
            icon: AlertTriangle,
            title: "Limitation of Liability",
            body: "Convoox is not liable for any data loss, corruption, or damages arising from use of this service. Always keep backups of your original files. Download and verify results before deleting local copies.",
          },
          {
            icon: Copyright,
            title: "Intellectual Property",
            body: "Your files remain yours. Uploading a file for conversion does not transfer ownership to Convoox. The Convoox name, branding, interface, and software remain our intellectual property and may not be copied or redistributed without permission.",
          },
          {
            icon: RefreshCw,
            title: "Changes to Terms",
            body: "We may modify these terms at any time as the service evolves. Updated terms will be posted on this page. Continued use of Convoox after changes constitutes acceptance of the updated terms.",
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
          Fair Use Commitment
        </h2>
        <CalloutBanner icon={BadgeCheck} delay={0}>
          These terms exist to keep Convoox free, fast, and fair for everyone. Use the tools responsibly, respect copyright and the law, and we will keep focusing on a reliable conversion experience without unnecessary barriers.
        </CalloutBanner>
      </CompanyPageSection>
    </div>
  );
}
