import type { Metadata } from "next";
import { ComingSoonPageContent } from "@/components/marketing/zolvstack/ComingSoonPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";

export const metadata: Metadata = {
  title: "Careers | ZolvStack",
  description: "Career opportunities at ZolvStack.",
  robots: { index: false, follow: true },
};

export default function CareersPage() {
  return (
    <ZolvStackPageShell>
      <ComingSoonPageContent
        title="Careers"
        description="We are a small team building focused tools for everyday work. Open roles will be posted here when we are hiring — or say hello through Contact in the meantime."
      />
    </ZolvStackPageShell>
  );
}
