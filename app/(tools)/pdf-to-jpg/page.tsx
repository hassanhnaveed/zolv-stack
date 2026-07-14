import type { Metadata } from "next";
import { TOOL_CONFIG } from "@/lib/utils";
import { ToolPage } from "@/components/tools/ToolPage";

const config = TOOL_CONFIG["pdf-to-jpg"];

export const metadata: Metadata = {
  title: "PDF to JPG — Free Online Converter | Extract PDF Pages as Images",
  description: "Convert PDF pages to JPG images free online. Extract every page as a high quality JPG. No signup, no watermarks, instant download.",
  keywords: "pdf to jpg, pdf to image, convert pdf to jpg online free, extract pdf pages",
  alternates: { canonical: "https://convoox.netlify.app/pdf-to-jpg" },
};

export default function Page() {
  return <ToolPage slug="pdf-to-jpg" />;
}