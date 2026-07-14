import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const tempDir = await mkdtemp(path.join(tmpdir(), "docx-"));
  const inputPath = path.join(tempDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inputPath, buffer);

  try {
    const sofficeCmd =
      process.platform === "win32"
        ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
        : "soffice";

    await execAsync(
      `${sofficeCmd} --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`
    );

    const outputName = file.name.replace(/\.docx$/i, ".pdf");
    const outputPath = path.join(tempDir, outputName);
    const pdfBuffer = await readFile(outputPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputName}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  } finally {
    await unlink(inputPath).catch(() => {});
  }
}