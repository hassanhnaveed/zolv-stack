import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "Image to AVIF Converter — Free Online | Next-Gen Format",
  description:
    "Convert any image to AVIF format free online. Better compression than WebP. JPG, PNG, WebP, GIF to AVIF. No signup, no watermarks.",
  keywords:
    "image to avif, jpg to avif, png to avif, convert to avif free online",
  alternates: { canonical: "https://convoox.netlify.app/image-to-avif" },
};

export default function Page() {
  return <ToolPage slug="image-to-avif" />;
}
