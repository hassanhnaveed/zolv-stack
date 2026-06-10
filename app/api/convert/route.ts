import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { TOOL_CONFIG, type ToolSlug } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_INPUT: Record<string, string[]> = {
  "image-to-webp": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/avif",
  ],
  "webp-to-jpg": ["image/webp"],
  "webp-to-png": ["image/webp"],
  "heic-to-jpg": ["image/heic", "image/heif"],
};

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    const tool = fd.get("tool") as ToolSlug | null;
    const quality = Math.min(100, Math.max(1, Number(fd.get("quality") || 85)));

    if (!file || !tool) {
      return NextResponse.json(
        { error: "Missing file or tool" },
        { status: 400 },
      );
    }

    const allowed = ALLOWED_INPUT[tool];
    if (!allowed || !allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported format for ${tool}` },
        { status: 415 },
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 50MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const config = TOOL_CONFIG[tool];
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
      case "webp-to-jpg":
        outputBuffer = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
        outputMime = "image/jpeg";
        break;
      case "webp-to-png":
        outputBuffer = await img.png({ compressionLevel: 9 }).toBuffer();
        outputMime = "image/png";
        break;
      case "heic-to-jpg":
        outputBuffer = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
        outputMime = "image/jpeg";
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
  } catch (err: any) {
    console.error("Convert error:", err);
    return NextResponse.json(
      { error: "Conversion failed. Please try another file." },
      { status: 500 },
    );
  }
}
