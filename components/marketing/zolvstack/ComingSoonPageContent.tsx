"use client";

import { Clock } from "lucide-react";
import {
  ContentPageHero,
  CalloutBanner,
  CompanyPageSection,
} from "@/components/marketing/company/ContentPageHero";

type ComingSoonPageContentProps = {
  title: string;
  description: string;
};

export function ComingSoonPageContent({
  title,
  description,
}: ComingSoonPageContentProps) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <ContentPageHero title={title} />

      <CompanyPageSection style={{ paddingTop: 12 }}>
        <CalloutBanner icon={Clock}>{description}</CalloutBanner>
      </CompanyPageSection>
    </div>
  );
}
