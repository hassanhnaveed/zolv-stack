import { SecurityPageContent } from "@/components/marketing/company/SecurityPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.SECURITY);

export default function SecurityPage() {
  return (
    <ZolvStackPageShell>
      <SecurityPageContent />
    </ZolvStackPageShell>
  );
}
