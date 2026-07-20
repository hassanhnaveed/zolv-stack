// import { NextRequest, NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";
// import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
// import { tmpdir } from "os";
// import path from "path";

// const execAsync = promisify(exec);

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const tempDir = await mkdtemp(path.join(tmpdir(), "office-"));
//   const inputPath = path.join(tempDir, file.name);
//   const buffer = Buffer.from(await file.arrayBuffer());
//   await writeFile(inputPath, buffer);

//   try {
//     const sofficeCmd =
//   process.platform === "win32"
//     ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
//     : "soffice";

// await execAsync(
//   `${sofficeCmd} --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}" -env:UserInstallation=file://${tempDir}/loprofile`
// );

//     // Input ka jo bhi extension ho (.doc, .docx, .odt, .rtf, .txt, .html, .md),
//     // output hamesha .pdf hi hoga
//     const outputName = file.name.replace(/\.[^.]+$/, ".pdf");
//     const outputPath = path.join(tempDir, outputName);
//     const pdfBuffer = await readFile(outputPath);

//     return new NextResponse(pdfBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${outputName}"`,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
//   } finally {
//     await unlink(inputPath).catch(() => {});
//   }
// }

//new

// import { NextRequest, NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";
// import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
// import { tmpdir } from "os";
// import path from "path";

// const execAsync = promisify(exec);

// const MIME_MAP: Record<string, string> = {
//   pdf: "application/pdf",
//   docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   odt: "application/vnd.oasis.opendocument.text",
//   rtf: "application/rtf",
//   txt: "text/plain",
//   html: "text/html",
// };

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;
//   const targetFormat = ((formData.get("targetFormat") as string) || "pdf").toLowerCase();

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const tempDir = await mkdtemp(path.join(tmpdir(), "office-"));
//   const inputPath = path.join(tempDir, file.name);
//   const buffer = Buffer.from(await file.arrayBuffer());
//   await writeFile(inputPath, buffer);

//   try {
//     const sofficeCmd =
//       process.platform === "win32"
//         ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
//         : "soffice";

//     await execAsync(
//       `${sofficeCmd} --headless --convert-to ${targetFormat} --outdir "${tempDir}" "${inputPath}" -env:UserInstallation=file://${tempDir}/loprofile`
//     );

//     // Input ka jo bhi extension ho, output target format ke hisab se banega
//     const outputName = file.name.replace(/\.[^.]+$/, `.${targetFormat}`);
//     const outputPath = path.join(tempDir, outputName);
//     const outBuffer = await readFile(outputPath);

//     return new NextResponse(outBuffer, {
//       headers: {
//         "Content-Type": MIME_MAP[targetFormat] || "application/octet-stream",
//         "Content-Disposition": `attachment; filename="${outputName}"`,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
//   } finally {
//     await unlink(inputPath).catch(() => {});
//   }
// }


//new docx

import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const execAsync = promisify(exec);

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain",
  html: "text/html",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const targetFormat = ((formData.get("targetFormat") as string) || "pdf").toLowerCase();

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const tempDir = await mkdtemp(path.join(tmpdir(), "office-"));
  const inputPath = path.join(tempDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inputPath, buffer);

  const isPdfInput = file.name.toLowerCase().endsWith(".pdf");

  try {
    // Special case: PDF → DOCX uses the dedicated Python script (pdf2docx),
    // it's more reliable than LibreOffice for this specific conversion.
    if (isPdfInput && targetFormat === "docx") {
      const outputName = file.name.replace(/\.pdf$/i, ".docx");
      const outputPath = path.join(tempDir, outputName);
      const scriptPath = path.join(process.cwd(), "scripts", "pdf_to_word.py");

      await execAsync(`python3 "${scriptPath}" "${inputPath}" "${outputPath}"`);

      const outBuffer = await readFile(outputPath);
      return new NextResponse(outBuffer, {
        headers: {
          "Content-Type": MIME_MAP.docx,
          "Content-Disposition": `attachment; filename="${outputName}"`,
        },
      });
    }

    // Everything else goes through LibreOffice
    const sofficeCmd =
      process.platform === "win32"
        ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
        : "soffice";

    await execAsync(
      `${sofficeCmd} --headless --convert-to ${targetFormat} --outdir "${tempDir}" "${inputPath}" -env:UserInstallation=file://${tempDir}/loprofile`
    );

    const outputName = file.name.replace(/\.[^.]+$/, `.${targetFormat}`);
    const outputPath = path.join(tempDir, outputName);
    const outBuffer = await readFile(outputPath);

    return new NextResponse(outBuffer, {
      headers: {
        "Content-Type": MIME_MAP[targetFormat] || "application/octet-stream",
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