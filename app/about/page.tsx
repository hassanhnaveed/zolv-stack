import { ZolvStackAboutPageContent } from "@/components/marketing/zolvstack/ZolvStackAboutPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.ABOUT);

export default function AboutPage() {
  return (
    <ZolvStackPageShell>
      <ZolvStackAboutPageContent />
    </ZolvStackPageShell>
  );
}
