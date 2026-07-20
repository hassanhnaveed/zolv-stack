import { ContactPageContent } from "@/components/marketing/company/ContactPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.CONTACT);

export default function ContactPage() {
  return (
    <ZolvStackPageShell>
      <ContactPageContent />
    </ZolvStackPageShell>
  );
}
