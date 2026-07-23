import { NextRequest, NextResponse } from "next/server";
import {
  checkContactRateLimit,
  sendContactEmail,
  validateContactPayload,
  type ContactPayload,
} from "@/lib/contact";
import { getErrorMessage } from "@/lib/utils";

export const runtime = "nodejs";

/** Best-effort client IP. Prefer proxy-set headers when present. */
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const rate = checkContactRateLimit(clientIp(req));
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    let body: ContactPayload;
    try {
      body = (await req.json()) as ContactPayload;
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const validated = validateContactPayload(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    // Honeypot trip: identical success response, no email sent.
    if (validated.isHoneypot) {
      return NextResponse.json({ ok: true });
    }

    const sent = await sendContactEmail(validated.fields);
    if (!sent.ok) {
      console.error("Contact email failed:", sent.reason, sent.detail);
      if (sent.reason === "misconfigured") {
        return NextResponse.json(
          { error: "Contact form is temporarily unavailable." },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: "Unable to send your message. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Contact API error:", getErrorMessage(err));
    return NextResponse.json(
      { error: "Unable to send your message. Please try again later." },
      { status: 500 },
    );
  }
}
