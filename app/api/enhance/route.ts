//picwish api integration
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("image") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No image provided" }, { status: 400 });
//     }

//     const apiKey = process.env.PICWISH_API_KEY!;

//     // Step 1: Task create karo
//     const uploadForm = new FormData();
//     uploadForm.append("image_file", file);
//     uploadForm.append("sync", "1"); // sync mode - direct result
//     uploadForm.append("type", "clean"); // non-portrait best
//     uploadForm.append("scale_factor", "2"); // 2x upscale
//     uploadForm.append("return_type", "1"); // URL return

//     const createRes = await fetch(
//       "https://techhk.aoscdn.com/api/tasks/visual/scale",
//       {
//         method: "POST",
//         headers: { "X-API-KEY": apiKey },
//         body: uploadForm,
//       },
//     );

//     const createData = await createRes.json();
//     console.log("Picwish create response:", createData);

//     if (!createData.data) {
//       throw new Error(createData.message || "Task creation failed");
//     }

//     // Sync mode mein direct image milti hai
//     if (createData.data.image) {
//       return NextResponse.json({
//         success: true,
//         enhancedUrl: createData.data.image,
//       });
//     }

//     // Async mode mein task_id milta hai - polling karo
//     const taskId = createData.data.task_id;
//     if (!taskId) throw new Error("No task_id received");

//     // Polling - max 30 seconds
//     for (let i = 0; i < 30; i++) {
//       await new Promise((r) => setTimeout(r, 1000));

//       const resultRes = await fetch(
//         `https://techhk.aoscdn.com/api/tasks/visual/scale/${taskId}`,
//         { headers: { "X-API-KEY": apiKey } },
//       );

//       const resultData = await resultRes.json();
//       console.log(`Poll ${i + 1}:`, resultData);

//       if (resultData.data?.progress >= 100 && resultData.data?.image) {
//         return NextResponse.json({
//           success: true,
//           enhancedUrl: resultData.data.image,
//         });
//       }

//       if (resultData.data?.state < 0) {
//         throw new Error("Enhancement failed on server");
//       }
//     }

//     throw new Error("Timeout - please try again");
//   } catch (err: any) {
//     console.error("Enhancement error:", err);
//     return NextResponse.json(
//       { error: err.message || "Enhancement failed" },
//       { status: 500 },
//     );
//   }
// }

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
      await execFileAsync("py", ["-3.11", scriptPath, tmpInput, tmpOutput], {
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
