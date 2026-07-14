import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { getErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const tool = fd.get("tool") as string;
    const files = fd.getAll("file") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // ── Image → PDF ──────────────────────────────────────────
    if (tool === "image-to-pdf") {
      const ALLOWED_IMG = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/tiff",
        "image/webp",
        "image/avif",
        "image/heic",
        "image/heif",
      ];

      for (const file of files) {
        if (!ALLOWED_IMG.includes(file.type)) {
          return NextResponse.json(
            { error: `Unsupported format: ${file.type}` },
            { status: 415 },
          );
        }
      }

      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const buf = Buffer.from(await file.arrayBuffer());
        const pngBuf = await sharp(buf).png().toBuffer();
        const img = await pdfDoc.embedPng(pngBuf);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="converted.pdf"',
          "Cache-Control": "no-store",
        },
      });
    }

    // ── PDF Merge ─────────────────────────────────────────────
    if (tool === "pdf-merge") {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const buf = Buffer.from(await file.arrayBuffer());
        const src = await PDFDocument.load(buf);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="merged.pdf"',
          "Cache-Control": "no-store",
        },
      });
    }

    // ── PDF Compress ──────────────────────────────────────────
    if (tool === "pdf-compress") {
      const file = files[0];
      const buf = Buffer.from(await file.arrayBuffer());
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="compressed.pdf"',
          "Cache-Control": "no-store",
        },
      });
    }

    // ── PDF → JPG ─────────────────────────────────────────────
    if (tool === "pdf-to-jpg") {
      const file = files[0];
      const buf = Buffer.from(await file.arrayBuffer());

      try {
       

        const os = await import("os");
        const fs = await import("fs");
        const path = await import("path");
        const { execSync } = await import("child_process");

        const tmpDir = os.tmpdir();
        const tmpPdf = path.join(tmpDir, `input-${Date.now()}.pdf`);
        const timestamp = Date.now();
        const tmpJpgPattern = path.join(tmpDir, `output-${timestamp}-%03d.jpg`);

        // Save PDF to temp
        fs.writeFileSync(tmpPdf, buf);

        // Run Ghostscript
        const gsCmd = process.platform === "win32" ? "gswin64c" : "gs";
        const result = execSync(
  `${gsCmd} -dNOPAUSE -dBATCH -sDEVICE=jpeg -r150 -dJPEGQ=92 -sOutputFile="${tmpJpgPattern}" "${tmpPdf}"`,
  { stdio: "pipe", encoding: "utf8" },
);

        console.log("GS output:", result);

        // Find all generated jpg files
        const allFiles = fs.readdirSync(tmpDir);
        const jpgFiles = allFiles
          .filter(
            (f) => f.startsWith(`output-${timestamp}`) && f.endsWith(".jpg"),
          )
          .sort();

        console.log("Looking for files with prefix:", `output-${timestamp}`);
        console.log(
          "All temp files:",
          allFiles.filter((f) => f.includes("output")),
        );
        console.log("Found jpg files:", jpgFiles);

        // Cleanup PDF
        fs.unlinkSync(tmpPdf);

        // Single page — return JPG directly
        if (jpgFiles.length === 1) {
          const jpgBuffer = fs.readFileSync(path.join(tmpDir, jpgFiles[0]));
          fs.unlinkSync(path.join(tmpDir, jpgFiles[0]));

          return new NextResponse(jpgBuffer as unknown as BodyInit, {
            headers: {
              "Content-Type": "image/jpeg",
              "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", ".jpg")}"`,
              "Cache-Control": "no-store",
            },
          });
        }

        // Multiple pages — ZIP
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();

        for (let i = 0; i < jpgFiles.length; i++) {
          const jpgPath = path.join(tmpDir, jpgFiles[i]);
          const jpgBuffer = fs.readFileSync(jpgPath);
          zip.file(`page-${i + 1}.jpg`, jpgBuffer);
          fs.unlinkSync(jpgPath);
        }

        const zipBuffer = await zip.generateAsync({ type: "uint8array" });

        return new NextResponse(Buffer.from(zipBuffer), {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${file.name.replace(".pdf", "-pages.zip")}"`,
            "Cache-Control": "no-store",
          },
        });
      } catch (e: unknown) {
        console.error("PDF to JPG error:", getErrorMessage(e));
        return NextResponse.json(
          { error: getErrorMessage(e, "Conversion failed") },
          { status: 501 },
        );
      }
    }
    return NextResponse.json({ error: "Unknown PDF tool" }, { status: 400 });
  } catch (err: unknown) {
    console.error("PDF error:", err);
    return NextResponse.json(
      { error: "PDF processing failed." },
      { status: 500 },
    );
  }
}
