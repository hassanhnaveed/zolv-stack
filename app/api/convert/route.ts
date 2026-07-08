import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { type ToolSlug, TOOL_CONFIG } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const tool = fd.get("tool") as ToolSlug | "webp-to-jpg" | "webp-to-png" | null;
    const quality = Math.min(100, Math.max(1, Number(fd.get("quality") || 85)));

    if (!file || !tool) {
      return NextResponse.json(
        { error: "Missing file or tool" },
        { status: 400 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 50MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const configTool =
      tool === "webp-to-jpg"
        ? "image-to-jpg"
        : tool === "webp-to-png"
        ? "image-to-png"
        : tool;
    const config = TOOL_CONFIG[configTool];
    const img = sharp(buffer, { failOn: "none" }).rotate();

    let outputBuffer: Buffer;
    let outputMime: string;

    switch (tool) {
      case "image-to-webp":
        outputBuffer = await img
          .webp({ quality, effort: 4, smartSubsample: true })
          .toBuffer();
        outputMime = "image/webp";
        break;

      case "image-to-jpg":
      case "webp-to-jpg":
      case "heic-to-jpg":
        outputBuffer = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
        outputMime = "image/jpeg";
        break;

      case "image-to-png":
      case "webp-to-png":
        outputBuffer = await img.png({ compressionLevel: 9 }).toBuffer();
        outputMime = "image/png";
        break;

      case "image-to-avif":
        outputBuffer = await img.avif({ quality, effort: 4 }).toBuffer();
        outputMime = "image/avif";
        break;

      case "image-to-gif":
        outputBuffer = await img.gif().toBuffer();
        outputMime = "image/gif";
        break;

      case "image-to-bmp":
        // Sharp BMP support nahi karta — PNG ke through karte hain
        outputBuffer = await img.png().toBuffer();
        outputMime = "image/bmp";
        break;

      case "image-to-tiff":
        outputBuffer = await img
          .tiff({ quality, compression: "lzw" })
          .toBuffer();
        outputMime = "image/tiff";
        break;

      default:
        return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
    }

    const outName = encodeURIComponent(
      file.name.replace(/\.[^.]+$/, config.outputExt),
    );

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": outputMime,
        "Content-Disposition": `attachment; filename="${outName}"`,
        "Content-Length": outputBuffer.length.toString(),
        "Cache-Control": "no-store",
        "X-Original-Size": file.size.toString(),
        "X-Converted-Size": outputBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    console.error("Convert error:", err);
    return NextResponse.json(
      { error: "Conversion failed. Please try another file." },
      { status: 500 },
    );
  }
}
