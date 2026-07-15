import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "Image to BMP Converter — Free Online | JPG, PNG, WebP to BMP",
  description:
    "Convert any image to BMP format free online. JPG, PNG, WebP to BMP. Maximum compatibility with Windows applications. No signup.",
  keywords: "image to bmp, jpg to bmp, png to bmp, convert to bmp free online",
  alternates: { canonical: "https://fileora.netlify.app/image-to-bmp" },
};

export default function Page() {
  return <ToolPage slug="image-to-bmp" />;
}
