import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 15MB." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const os = await import("os");
    const fs = await import("fs");
    const path = await import("path");
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    const inputExt = path.extname(file.name) || ".jpg";
    const tmpInput = path.join(tmpDir, `bg-input-${timestamp}${inputExt}`);
    const tmpOutput = path.join(tmpDir, `bg-output-${timestamp}.png`);

    fs.writeFileSync(tmpInput, buffer);

    const scriptPath = path.join(process.cwd(), "scripts", "remove_bg.py");

    await execFileAsync("python", [scriptPath, tmpInput, tmpOutput], {
      timeout: 50000,
    });

    const outputBuffer = fs.readFileSync(tmpOutput);

    // Cleanup
    fs.unlinkSync(tmpInput);
    fs.unlinkSync(tmpOutput);

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="no-bg-${file.name.replace(/\.[^.]+$/, ".png")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    console.error("Background removal error:", err);
    return NextResponse.json(
      { error: "Background removal failed: " + getErrorMessage(err) },
      { status: 500 },
    );
  }
}
