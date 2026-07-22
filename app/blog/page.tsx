import type { Metadata } from "next";
import { ComingSoonPageContent } from "@/components/marketing/zolvstack/ComingSoonPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";

export const metadata: Metadata = {
  title: "Blog | ZolvStack",
  description: "Updates, product news, and insights from the ZolvStack team.",
  robots: { index: false, follow: true },
};

export default function BlogPage() {
  return (
    <ZolvStackPageShell>
      <ComingSoonPageContent
        title="Blog"
        description="We are preparing a space for product updates, launch notes, and practical guides from the ZolvStack team. Check back soon."
      />
    </ZolvStackPageShell>
  );
}
