// import { NextRequest, NextResponse } from "next/server";
// import { pdf } from "pdf-parse";

// export async function POST(req: NextRequest) {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;

//   if (!file) {
//     return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const buffer = Buffer.from(await file.arrayBuffer());
//   const data = await pdf(buffer);

//   return new NextResponse(data.text, {
//     headers: {
//       "Content-Type": "text/plain",
//       "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, ".txt")}"`,
//     },
//   });
// }

import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  return new NextResponse(result.text, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, ".txt")}"`,
    },
  });
}