"use client";

import {
  Shield,
  Server,
  UserX,
  BarChart3,
  Cookie,
  Megaphone,
  RefreshCw,
  HeartHandshake,
} from "lucide-react";
import { ContentPageHero, CalloutBanner, CompanyPageSection } from "./ContentPageHero";
import { FeatureCardGrid } from "./FeatureCardGrid";

export function PrivacyPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="Privacy Policy" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Shield} emphasized>
          Your privacy at Convoox comes first. We process files only to convert them, never store uploads on our servers, and do not require an account. This policy explains what we collect, what we do not, and how we keep your data protected.
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        items={[
          {
            icon: Server,
            title: "Files & Processing",
            body: "Convoox processes your files entirely in server memory. We do not store, log, or share any uploaded files. Once conversion is complete and you download your result, the original upload and converted output are discarded immediately from our systems.",
          },
          {
            icon: UserX,
            title: "No Account Required",
            body: "We do not require registration to use Convoox. We do not collect personal information such as names, email addresses, or payment details for our free tools. You can convert files without creating a profile or handing over contact data.",
          },
          {
            icon: BarChart3,
            title: "Analytics",
            body: "We may use privacy-respecting analytics—such as page view counts—to understand which tools are popular and where we should improve. These metrics do not include personally identifiable information or the contents of your files.",
          },
          {
            icon: Cookie,
            title: "Cookies",
            body: "We use minimal cookies only for essential website functionality, such as keeping basic preferences and protecting the service. We do not set third-party advertising cookies ourselves as part of core Convoox features.",
          },
          {
            icon: Megaphone,
            title: "Advertising",
            body: "We may display third-party advertisements to keep Convoox free. Ad networks may use their own cookies to serve relevant ads. You can manage or opt out of many of these cookies through your browser settings.",
          },
          {
            icon: RefreshCw,
            title: "Policy Updates",
            body: "We may update this privacy policy as Convoox grows or our practices change. When we do, we will refresh this page. Continued use of Convoox after an update constitutes acceptance of the revised policy.",
          },
        ]}
        variant="alt"
      />

      <CompanyPageSection style={{ paddingTop: 8 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 2.5vw, 24px)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
            textAlign: "left",
            marginBottom: 14,
          }}
        >
          Your Privacy Matters
        </h2>
        <CalloutBanner icon={HeartHandshake} delay={0}>
          We built Convoox so you can convert files with confidence. Your uploads are never retained, your identity is not required, and we keep third-party exposure to a minimum. If you have questions about this policy, please reach out through our contact channels.
        </CalloutBanner>
      </CompanyPageSection>
    </div>
  );
}
