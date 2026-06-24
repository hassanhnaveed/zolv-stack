import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;

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

    const os = await import("os");
    const fs = await import("fs");
    const path = await import("path");
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    const tmpInput = path.join(tmpDir, `pdf-input-${timestamp}.pdf`);
    const tmpOutput = path.join(tmpDir, `pdf-output-${timestamp}.docx`);

    fs.writeFileSync(tmpInput, buffer);

    const scriptPath = path.join(process.cwd(), "scripts", "pdf_to_word.py");

    await execFileAsync("python3", [scriptPath, tmpInput, tmpOutput], {
      timeout: 55000,
      maxBuffer: 1024 * 1024 * 50,
    });

    const outputBuffer = fs.readFileSync(tmpOutput);

    fs.unlinkSync(tmpInput);
    fs.unlinkSync(tmpOutput);

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="converted-${file.name.replace(".pdf", ".docx")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("PDF to Word error:", err);
    return NextResponse.json(
      { error: "Conversion failed: " + err.message },
      { status: 500 },
    );
  }
}
