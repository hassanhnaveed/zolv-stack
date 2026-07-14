import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContactPageContent } from "@/components/marketing/company/ContactPageContent";

export const metadata: Metadata = { title: "Contact Us", alternates: { canonical: "/contact" } };

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
