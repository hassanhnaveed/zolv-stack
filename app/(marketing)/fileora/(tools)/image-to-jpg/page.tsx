import type { Metadata } from "next";
import { TOOL_CONFIG } from "@/lib/utils";
import { ToolPage } from "@/components/tools/ToolPage";

const config = TOOL_CONFIG["image-to-jpg"];

export const metadata: Metadata = {
  title: "Image to JPG Converter — Free Online | PNG, WebP, AVIF to JPG",
  description:
    "Convert any image to JPG format free online. PNG, WebP, AVIF, BMP, TIFF, GIF, HEIC to JPG. No signup, no watermarks, instant download.",
  keywords: "image to jpg, png to jpg, webp to jpg, convert to jpg free online",
  alternates: { canonical: "https://fileora.netlify.app/fileora/image-to-jpg" },
};

export default function Page() {
  return <ToolPage slug="image-to-jpg" />;
}
