import type { Metadata } from "next";
import { TOOL_CONFIG } from "@/lib/utils";
import { ToolPage } from "@/components/tools/ToolPage";

const config = TOOL_CONFIG["heic-to-jpg"];

export const metadata: Metadata = {
  title: config.title + " — Free Online Converter",
  description: config.longDesc,
  alternates: { canonical: "/fileora/heic-to-jpg" },
};

export default function Page() {
  return <ToolPage slug="heic-to-jpg" />;
}
