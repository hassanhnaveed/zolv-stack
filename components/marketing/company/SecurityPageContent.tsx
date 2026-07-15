"use client";

import {
  Shield,
  Server,
  UserX,
  Lock,
  HardDrive,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { ContentPageHero, CalloutBanner, CompanyPageSection } from "./ContentPageHero";
import { FeatureCardGrid } from "./FeatureCardGrid";

export function SecurityPageContent() {
  return (
    <div style={{ paddingBottom: 48 }}>
      <ContentPageHero title="Security" />

      <CompanyPageSection style={{ paddingTop: 12, paddingBottom: 4 }}>
        <CalloutBanner icon={ShieldCheck} emphasized>
          Your privacy and security are our top priorities. Fileora is built from the ground up to protect your data at every step of the conversion process. We do not store any user files or personal data on our website or backend. Files are processed only for conversion and are automatically discarded after processing.
        </CalloutBanner>
      </CompanyPageSection>
      <FeatureCardGrid
        items={[
          {
            icon: Server,
            title: "Secure File Processing",
            body: "All file conversions happen on our servers in isolated, in-memory sessions. Your files are never written to disk, logged, or retained after the conversion completes. The moment you download your result, the original upload and converted output are permanently deleted from our systems.",
          },
          {
            icon: UserX,
            title: "No Data Collection",
            body: "Fileora does not require an account, email address, or any personal information to use our tools. We do not build user profiles, track individual file contents, or sell data to third parties. Your conversion activity stays private.",
          },
          {
            icon: Lock,
            title: "Encrypted Connections",
            body: "Every connection to Fileora is served over HTTPS with TLS encryption. This means your files are encrypted in transit between your browser and our servers, protecting them from interception during upload and download.",
          },
          {
            icon: HardDrive,
            title: "No Persistent Storage",
            body: "We have no database of user files, no cloud storage buckets for uploads, and no backup copies of your content. Our architecture is intentionally designed so that files exist only for the brief moment needed to perform the conversion.",
          },
          {
            icon: ShieldCheck,
            title: "Minimal Third-Party Exposure",
            body: "We limit third-party integrations to essential infrastructure only. We do not share your files with external services for processing, analytics, or advertising. Any analytics we use are privacy-respecting and do not include personally identifiable information.",
          },
          {
            icon: HeartHandshake,
            title: "Your Trust Matters",
            body: "Security is not a feature we bolt on — it is foundational to how Fileora works. We believe you should be able to convert files with complete confidence that your data remains yours. If you have questions about our security practices, please reach out through our contact channels.",
          },
        ]}
        variant="alt"
      />
    </div>
  );
}
