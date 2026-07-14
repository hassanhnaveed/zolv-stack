import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TermsPageContent } from "@/components/marketing/company/TermsPageContent";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

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
