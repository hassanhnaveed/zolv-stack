"use client";

import {
  MessageCircle,
  Shield,
  LifeBuoy,
  Handshake,
  Mail,
  HeartHandshake,
} from "lucide-react";
import { ContentPageHero, CalloutBanner, CompanyPageSection } from "./ContentPageHero";
import { FeatureCardGrid } from "./FeatureCardGrid";
import { ContactForm } from "./ContactForm";

export function ContactPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="Contact Us" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={Mail} emphasized>
          Have a question, feedback, or partnership idea? We&apos;d love to hear from you. Send us a message and our team will get back to you as soon as we can — whether it&apos;s about Convoox tools, privacy, security, or anything else on your mind.
        </CalloutBanner>
      </CompanyPageSection>

      <FeatureCardGrid
        items={[
          {
            icon: MessageCircle,
            title: "General Inquiries",
            body: "Questions about Convoox, our tools, or how the platform works? Reach out anytime. We welcome feedback that helps us improve the experience for everyone.",
          },
          {
            icon: Shield,
            title: "Privacy & Security",
            body: "If you have concerns about how we handle files, data, or account-free usage, contact us directly. We take privacy seriously and are happy to explain our practices in detail.",
          },
          {
            icon: LifeBuoy,
            title: "Technical Support",
            body: "Running into an issue with a conversion, upload, or download? Share the tool you used and what happened. The more detail you provide, the faster we can help.",
          },
          {
            icon: Handshake,
            title: "Partnerships & Feedback",
            body: "Interested in collaborating, integrating, or suggesting a new feature? We read every message and use your input to shape what Convoox becomes next.",
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
          Send Us a Message
        </h2>
        <ContactForm />
      </CompanyPageSection>

      <CompanyPageSection style={{ paddingTop: 24 }}>
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
          We&apos;re Here to Help
        </h2>
        <CalloutBanner icon={HeartHandshake} delay={0}>
          Convoox is built for real people with real questions. Whether you need help with a tool, want to report a concern, or simply want to say hello — your message matters to us. We aim to respond thoughtfully and keep every conversation respectful and private.
        </CalloutBanner>
      </CompanyPageSection>
    </div>
  );
}
