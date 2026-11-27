import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/review-server";
import type { AnalyticsEventType } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_EVENT_TYPES = new Set<AnalyticsEventType>([
  "page_view",
  "page_exit",
  "checkout_open",
  "order_completed",
  "newsletter_signup",
]);

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table")
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const body = JSON.parse(rawText);
    const visitorId =
      typeof body?.visitor_id === "string" ? body.visitor_id.trim().slice(0, 120) : "";
    const sessionId =
      typeof body?.session_id === "string" ? body.session_id.trim().slice(0, 120) : "";
    const eventType = body?.event_type as AnalyticsEventType;
    const pagePath =
      typeof body?.page_path === "string" ? body.page_path.trim().slice(0, 400) : "/";

    if (!visitorId || !sessionId || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (pagePath.startsWith("/tl-k9x4m-control-7v2p")) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const durationSeconds =
      typeof body?.duration_seconds === "number" &&
      Number.isFinite(body.duration_seconds)
        ? Math.max(0, Math.min(3600, Math.round(body.duration_seconds)))
        : null;

    const metadata =
      body?.metadata &&
      typeof body.metadata === "object" &&
      !Array.isArray(body.metadata)
        ? body.metadata
        : {};

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("analytics_events").insert([
      {
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: eventType,
        page_path: pagePath,
        duration_seconds: durationSeconds,
        metadata,
      },
    ]);

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ ok: false, needsMigration: true });
      }
      console.warn("POST /api/analytics/track error:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
