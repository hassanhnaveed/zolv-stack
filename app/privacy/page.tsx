import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-1px", color: "#fff", marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 40 }}>Last updated: {new Date().getFullYear()}</p>

          {[
            { title: "Files & Privacy", body: "Fileora processes your files entirely in server memory. We do not store, log, or share any uploaded files. All data is discarded immediately after conversion." },
            { title: "No Account Required", body: "We do not require registration. We do not collect personal information such as names, email addresses, or payment details for our free tools." },
            { title: "Analytics", body: "We may use privacy-respecting analytics (e.g. page view counts) to understand which tools are popular. No personally identifiable information is collected." },
            { title: "Cookies", body: "We use minimal cookies only for essential website functionality. No third-party advertising cookies are set." },
            { title: "Ads", body: "We may display third-party advertisements. Ad networks may use cookies to serve relevant ads. You can opt out via your browser settings." },
            { title: "Changes", body: "We may update this policy. Continued use of Fileora constitutes acceptance of any changes." },
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
