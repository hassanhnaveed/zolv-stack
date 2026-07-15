import type { Metadata } from "next";
import { ToolPage } from "@/components/tools/ToolPage";

export const metadata: Metadata = {
  title: "PDF Split  Free Online | Extract & Separate PDF Pages",
  description:
    "Split any PDF into separate pages or custom page ranges. Free, unlimited, no signup required. Download individual pages or as ZIP.",
  keywords:
    "split pdf online free, pdf splitter, extract pdf pages, separate pdf pages",
  alternates: { canonical: "https://fileora.netlify.app/pdf-split" },
};

export default function Page() {
  return <ToolPage slug="pdf-split" />;
}
