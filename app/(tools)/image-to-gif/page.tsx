import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "Image to GIF Converter — Free Online | JPG, PNG, WebP to GIF",
  description:
    "Convert any image to GIF format free online. JPG, PNG, WebP to GIF. No signup, no watermarks, instant download.",
  keywords: "image to gif, jpg to gif, png to gif, convert to gif free online",
  alternates: { canonical: "https://convoox.netlify.app/image-to-gif" },
};

export default function Page() {
  return <ToolPage slug="image-to-gif" />;
}
