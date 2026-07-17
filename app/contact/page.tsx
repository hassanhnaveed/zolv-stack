import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactPageContent } from "@/components/marketing/company/ContactPageContent";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.CONTACT);

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <ContactPageContent />
      </main>
      <Footer />
    </>
  );
}
