import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SecurityPageContent } from "@/components/marketing/company/SecurityPageContent";

export const metadata: Metadata = { title: "Security", alternates: { canonical: "/security" } };

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
