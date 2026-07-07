import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-1px", color: "#fff", marginBottom: 8 }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 40 }}>Last updated: {new Date().getFullYear()}</p>

          {[
            { title: "Use of Service", body: "Fileora is provided for lawful personal and commercial use. You may not use this service to convert copyrighted material you do not own or have rights to." },
            { title: "No Warranty", body: "Fileora is provided 'as is' without warranty of any kind. We do not guarantee 100% uptime or conversion accuracy for all file types." },
            { title: "Limitation of Liability", body: "Fileora is not liable for any data loss or damages arising from use of this service. Always keep backups of your original files." },
            { title: "Acceptable Use", body: "Do not upload malicious files, illegal content, or attempt to abuse or overload our servers. We reserve the right to block abusive users." },
            { title: "Changes", body: "We may modify these terms at any time. Continued use constitutes acceptance of the updated terms." },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-text-1)", marginBottom: 10 }}>{title}</h2>
              <p style={{ fontSize: 15, color: "var(--color-text-2)", lineHeight: 1.8 }}>{body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
