import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrivacyPageContent } from "@/components/marketing/company/PrivacyPageContent";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

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
