import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SecurityPageContent } from "@/components/marketing/company/SecurityPageContent";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.SECURITY);

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <SecurityPageContent />
      </main>
      <Footer />
    </>
  );
}
