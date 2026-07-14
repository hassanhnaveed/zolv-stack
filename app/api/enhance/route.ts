
// new image enhacned with pyhton
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
    const tmpInput = path.join(tmpDir, `enhance-input-${timestamp}${inputExt}`);
    const tmpOutput = path.join(tmpDir, `enhance-output-${timestamp}.png`);

    fs.writeFileSync(tmpInput, buffer);

    const scriptPath = path.join(process.cwd(), "scripts", "enhance_image.py");

    try {
      const pythonCmd = process.platform === "win32" ? "py" : "python3";
const pythonArgs = process.platform === "win32"
  ? ["-3.11", scriptPath, tmpInput, tmpOutput]
  : [scriptPath, tmpInput, tmpOutput];

await execFileAsync(pythonCmd, pythonArgs, {
        timeout: 50000,
        maxBuffer: 1024 * 1024 * 10,
      });
    } catch (execErr: unknown) {
      // Process crash ho sakta hai exit pe (ncnn/Vulkan cleanup issue)
      // Lekin agar output file ban gayi hai toh ignore karo
      if (!fs.existsSync(tmpOutput)) {
        throw execErr;
      }
      console.log(
        "Process exited with error but output file exists, continuing...",
      );
    }


    const outputBuffer = fs.readFileSync(tmpOutput);

    fs.unlinkSync(tmpInput);
    fs.unlinkSync(tmpOutput);

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="enhanced-${file.name.replace(/\.[^.]+$/, ".png")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    console.error("Enhance error:", err);
    return NextResponse.json(
      { error: "Enhancement failed: " + getErrorMessage(err) },
      { status: 500 },
    );
  }
}
