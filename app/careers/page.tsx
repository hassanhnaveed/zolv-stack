import type { Metadata } from "next";
import { ContributePageContent } from "@/components/marketing/zolvstack/ContributePageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";

export const metadata: Metadata = {
  title: "Contribute | ZolvStack",
  description:
    "ZolvStack is open source and community-driven. Contribute features, bug fixes, documentation, ideas, testing, or community support.",
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return (
    <ZolvStackPageShell>
      <ContributePageContent />
    </ZolvStackPageShell>
  );
}
