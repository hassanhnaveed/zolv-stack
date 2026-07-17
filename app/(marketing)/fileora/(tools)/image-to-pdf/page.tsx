import type { Metadata } from "next";
import { TOOL_CONFIG } from "@/lib/utils";
import { ToolPage } from "@/components/tools/ToolPage";

const config = TOOL_CONFIG["image-to-pdf"];

export const metadata: Metadata = {
  title: config.title + " — Free Online Converter",
  description: config.longDesc,
  alternates: { canonical: "/fileora/image-to-pdf" },
};

export default function Page() {
  return <ToolPage slug="image-to-pdf" />;
}
