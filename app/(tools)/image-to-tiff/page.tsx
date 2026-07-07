import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "Image to TIFF Converter — Free Online | JPG, PNG, WebP to TIFF",
  description:
    "Convert any image to TIFF format free online. High quality lossless format for professional photography. No signup, no watermarks.",
  keywords:
    "image to tiff, jpg to tiff, png to tiff, convert to tiff free online",
  alternates: { canonical: "https://fileora.netlify.app/image-to-tiff" },
};

export default function Page() {
  return <ToolPage slug="image-to-tiff" />;
}
