import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrivacyPageContent } from "@/components/marketing/company/PrivacyPageContent";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.PRIVACY);

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <PrivacyPageContent />
      </main>
      <Footer />
    </>
  );
}
