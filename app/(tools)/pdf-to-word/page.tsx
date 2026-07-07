import { ToolPage } from "@/components/tools/ToolPage";

export const metadata = {
  title: "PDF to Word Converter – Fileora",
  description:
    "Convert PDF files to editable Word documents for free. No signup, no limits.",
};

export default function PdfToWordPage() {
  return <ToolPage slug={"pdf-to-word"} />;
}
