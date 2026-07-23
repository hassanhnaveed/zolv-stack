import type { Metadata } from "next";
import { ComingSoonPageContent } from "@/components/marketing/zolvstack/ComingSoonPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";

export const metadata: Metadata = {
  title: "Documentation | ZolvStack",
  description: "Documentation for ZolvStack products and developer resources.",
  robots: { index: false, follow: true },
};

export default function DocsPage() {
  return (
    <ZolvStackPageShell>
      <ComingSoonPageContent
        title="Documentation"
        description="Product documentation and developer guides for the ZolvStack ecosystem are on the way. Fileora help content will live here as it expands."
      />
    </ZolvStackPageShell>
  );
}
