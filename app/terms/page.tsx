import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TermsPageContent } from "@/components/marketing/company/TermsPageContent";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.TERMS);

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <TermsPageContent />
      </main>
      <Footer />
    </>
  );
}
