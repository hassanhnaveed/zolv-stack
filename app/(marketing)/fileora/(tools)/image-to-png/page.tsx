import type { Metadata } from "next";
import { TOOL_CONFIG } from "@/lib/utils";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "Image to PNG Converter — Free Online | JPG, WebP, AVIF to PNG",
  description:
    "Convert any image to PNG format free online. JPG, WebP, AVIF, BMP, TIFF, GIF, HEIC to PNG with transparency. No signup, no watermarks.",
  keywords: "image to png, jpg to png, webp to png, convert to png free online",
  alternates: { canonical: "https://fileora.netlify.app/fileora/image-to-png" },
};

export default function Page() {
  return <ToolPage slug="image-to-png" />;
}
