import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutPageContent } from "@/components/marketing/company/AboutPageContent";

export const metadata: Metadata = { title: "About Us", alternates: { canonical: "/about" } };

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
