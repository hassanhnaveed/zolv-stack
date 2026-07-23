import { PrivacyPageContent } from "@/components/marketing/company/PrivacyPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.PRIVACY);

export default function PrivacyPage() {
  return (
    <ZolvStackPageShell>
      <PrivacyPageContent />
    </ZolvStackPageShell>
  );
}
