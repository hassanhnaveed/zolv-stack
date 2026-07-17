import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutPageContent } from "@/components/marketing/company/AboutPageContent";
import { buildMetadataForRoute, ROUTE_IDS } from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.ABOUT);

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
