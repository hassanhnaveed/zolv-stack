import type { Metadata } from "next";
import { ComingSoonPageContent } from "@/components/marketing/zolvstack/ComingSoonPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";

export const metadata: Metadata = {
  title: "Status | ZolvStack",
  description: "Service status and uptime information for ZolvStack products.",
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return (
    <ZolvStackPageShell>
      <ComingSoonPageContent
        title="Status"
        description="A public status page for ZolvStack services is coming soon. Until then, reach out via Contact if you notice an issue with any product."
      />
    </ZolvStackPageShell>
  );
}
