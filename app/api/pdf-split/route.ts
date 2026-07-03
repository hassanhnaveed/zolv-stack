import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";
export const maxDuration = 60;

function parsePageRanges(input: string, totalPages: number): number[][] {
  const ranges: number[][] = [];
  const parts = input.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      if (start >= 1 && end <= totalPages && start <= end) {
        ranges.push([start - 1, end - 1]);
      }
    } else {
      const page = Number(part);
      if (page >= 1 && page <= totalPages) {
        ranges.push([page - 1, page - 1]);
      }
    }
  }

  return ranges;
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const mode = (fd.get("mode") as string) || "all"; // "all" | "range"
    const rangeInput = (fd.get("ranges") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 50MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const srcDoc = await PDFDocument.load(buffer);
    const totalPages = srcDoc.getPageCount();

    // ── All pages — har page alag PDF ──────────────────────────
    if (mode === "all") {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);
        const pdfBytes = await newDoc.save();
        zip.file(`page-${i + 1}.pdf`, pdfBytes);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "-split.zip")}"`,
          "Cache-Control": "no-store",
          "X-Total-Pages": totalPages.toString(),
        },
      });
    }

    // ── Custom range — sirf selected pages ────────────────────
    if (mode === "range") {
      const ranges = parsePageRanges(rangeInput, totalPages);

      if (ranges.length === 0) {
        return NextResponse.json(
          { error: "Invalid page range" },
          { status: 400 },
        );
      }

      // Single range — direct PDF return
      if (ranges.length === 1) {
        const [start, end] = ranges[0];
        const newDoc = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i,
        );
        const pages = await newDoc.copyPages(srcDoc, pageIndices);
        pages.forEach((p) => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();

        return new NextResponse(new Uint8Array(pdfBytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="pages-${start + 1}-${end + 1}.pdf"`,
            "Cache-Control": "no-store",
          },
        });
      }

      // Multiple ranges — ZIP mein
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const [start, end] of ranges) {
        const newDoc = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i,
        );
        const pages = await newDoc.copyPages(srcDoc, pageIndices);
        pages.forEach((p) => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        zip.file(`pages-${start + 1}-${end + 1}.pdf`, pdfBytes);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "-split.zip")}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err: any) {
    console.error("PDF Split error:", err);
    return NextResponse.json(
      { error: "PDF split failed: " + err.message },
      { status: 500 },
    );
  }
}

// Total pages info
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
