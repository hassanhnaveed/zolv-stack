import { TermsPageContent } from "@/components/marketing/company/TermsPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.TERMS);

export default function TermsPage() {
  return (
    <ZolvStackPageShell>
      <TermsPageContent />
    </ZolvStackPageShell>
  );
}
